// The one audio graph for the app:
//   notes ─┐
//   ambience ─┼─> master (mute, sleep fade) ─> gentle compressor ─> speakers
//   music ─┘        ^
//   notes + music ──> shared reverb ┘
import type { Settings } from '../meta/settings'
import { createLayer, LAYERS, type Layer, type LayerName, type Mix } from './ambience'
import { loadBuffer, loadManifest } from './files'
import { Music } from './music'
import { gain, impulseResponse } from './noise'
import { Notes } from './notes'
import { sceneMix } from './scenes'

const LOOKAHEAD = 1.5 // seconds scheduled ahead; covers timer throttling when the tab is hidden
const TICK_MS = 250
const SLEEP_FADE_S = 120
const LAYER_FADE = 1.5 // time constant for crossfading layers when the scene changes

// Sliders feel even when gain follows the square of their position.
const curve = (v: number) => v * v

class AudioEngine {
  private ctx?: AudioContext
  private master!: GainNode
  private buses!: Record<'notes' | 'ambience' | 'music', GainNode>
  private sound?: Notes
  private music?: Music
  private layers = new Map<LayerName, Layer>()
  private layerStops = new Map<LayerName, number>()
  private recordings = new Map<LayerName, AudioBuffer>()
  private settings?: Settings
  private scene: { journey?: string; theme: 'day' | 'night' } = { theme: 'day' }
  private sleeping = false
  private fading = false // the sleep timer's slow fade owns the master volume
  private sleepTimers: number[] = []

  // Browsers only allow audio to start from a tap, so this is called on the first one.
  unlock() {
    if (!this.ctx) this.build()
    if (this.ctx!.state === 'suspended') this.ctx!.resume()
  }

  private build() {
    const ctx = new AudioContext({ latencyHint: 'interactive' })
    this.ctx = ctx
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -12
    limiter.ratio.value = 4
    limiter.connect(ctx.destination)
    this.master = gain(ctx, 0)
    this.master.connect(limiter)

    const reverb = ctx.createConvolver()
    reverb.buffer = impulseResponse(ctx)
    reverb.connect(gain(ctx, 0.35)).connect(this.master)

    this.buses = { notes: gain(ctx, 0), ambience: gain(ctx, 0), music: gain(ctx, 0) }
    for (const [name, bus] of Object.entries(this.buses)) {
      bus.connect(this.master)
      if (name !== 'ambience') bus.connect(gain(ctx, name === 'music' ? 0.6 : 0.3)).connect(reverb)
    }
    this.sound = new Notes(ctx, this.buses.notes)
    this.music = new Music(ctx, this.buses.music)

    setInterval(() => {
      const t = ctx.currentTime
      for (const layer of this.layers.values()) layer.schedule(t, t + LOOKAHEAD)
      this.music!.schedule(t, t + LOOKAHEAD)
    }, TICK_MS)

    this.loadRecordings(ctx)
    this.refresh()
  }

  private async loadRecordings(ctx: AudioContext) {
    const manifest = await loadManifest()
    const tracks = (await Promise.all((manifest.music ?? []).map((f) => loadBuffer(ctx, f)))).filter((b) => b !== undefined)
    if (tracks.length) this.music!.useTracks(tracks)
    for (const [name, file] of Object.entries(manifest.ambience ?? {}) as [LayerName, string][]) {
      const buffer = await loadBuffer(ctx, file)
      if (!buffer) continue
      this.recordings.set(name, buffer)
      this.layers.get(name)?.stop() // rebuild this layer from the recording
      this.layers.delete(name)
    }
    this.refresh()
  }

  // A layer built from a recording, if one was provided; otherwise the synthesised one.
  private makeLayer(name: LayerName): Layer {
    const ctx = this.ctx!
    const recording = this.recordings.get(name)
    if (!recording) return createLayer(ctx, name, this.buses.ambience)
    const out = gain(ctx, 0)
    out.connect(this.buses.ambience)
    const src = ctx.createBufferSource()
    src.buffer = recording
    src.loop = true
    src.connect(out)
    src.start(ctx.currentTime, Math.random() * recording.duration)
    return {
      out,
      schedule: () => {},
      stop: () => {
        src.stop()
        out.disconnect()
      },
    }
  }

  update(settings: Settings, scene: { journey?: string; theme: 'day' | 'night' }) {
    this.settings = settings
    this.scene = scene
    this.refresh()
  }

  private refresh() {
    const ctx = this.ctx
    const s = this.settings
    if (!ctx || !s) return
    const t = ctx.currentTime
    if (!this.sleeping && !this.fading) this.master.gain.setTargetAtTime(s.muted ? 0 : 1, t, 0.3)
    this.buses.notes.gain.setTargetAtTime(curve(s.volumeNotes), t, 0.1)
    this.buses.ambience.gain.setTargetAtTime(curve(s.volumeAmbience), t, 0.3)
    this.buses.music.gain.setTargetAtTime(curve(s.volumeMusic), t, 0.3)
    // Don't spend battery generating what can't be heard.
    if (s.volumeMusic > 0 && !s.muted && !this.sleeping) this.music!.start()
    else this.music!.stop()
    this.setMix(s.muted || this.sleeping || s.volumeAmbience === 0 ? {} : s.ambienceMode === 'custom' ? s.ambienceMix : sceneMix(this.scene.journey, this.scene.theme))
  }

  // Crossfades to a new set of layer levels; silent layers are torn down once faded out.
  private setMix(mix: Mix) {
    const t = this.ctx!.currentTime
    for (const name of LAYERS) {
      const level = mix[name] ?? 0
      let layer = this.layers.get(name)
      if (level > 0) {
        clearTimeout(this.layerStops.get(name))
        this.layerStops.delete(name)
        if (!layer) {
          layer = this.makeLayer(name)
          this.layers.set(name, layer)
        }
        layer.out.gain.setTargetAtTime(level, t, LAYER_FADE) // linear: the ambience slider already applies the curve
      } else if (layer && !this.layerStops.has(name)) {
        layer.out.gain.setTargetAtTime(0, t, LAYER_FADE)
        const l = layer
        this.layerStops.set(
          name,
          window.setTimeout(() => {
            l.stop()
            this.layers.delete(name)
            this.layerStops.delete(name)
          }, LAYER_FADE * 5000),
        )
      }
    }
  }

  // Game sounds. Safe to call before audio is unlocked; they simply don't play.
  letter = (index: number) => this.sound?.letter(index)
  word = () => this.sound?.word()
  bonus = () => this.sound?.bonus()
  repeat = () => this.sound?.repeat()
  reveal = () => this.sound?.reveal()
  levelComplete = () => this.sound?.levelComplete()

  // Sleep timer: after `minutes`, everything fades out over two minutes, then stops.
  sleepIn(minutes: number, onFading: () => void, onAsleep: () => void) {
    this.cancelSleep()
    const fadeIn = Math.max(0, minutes * 60 - SLEEP_FADE_S) * 1000
    this.sleepTimers.push(
      window.setTimeout(() => {
        onFading()
        this.fading = true
        const t = this.ctx?.currentTime ?? 0
        this.master?.gain.cancelScheduledValues(t)
        this.master?.gain.setValueAtTime(this.master.gain.value, t)
        this.master?.gain.linearRampToValueAtTime(0, t + SLEEP_FADE_S)
        this.sleepTimers.push(
          window.setTimeout(() => {
            this.sleeping = true
            this.fading = false
            this.refresh()
            onAsleep()
          }, SLEEP_FADE_S * 1000),
        )
      }, fadeIn),
    )
  }

  cancelSleep() {
    this.sleepTimers.forEach(clearTimeout)
    this.sleepTimers = []
  }

  wake() {
    this.cancelSleep()
    this.sleeping = false
    this.fading = false
    if (this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.refresh()
    }
  }
}

export const audio = new AudioEngine()
