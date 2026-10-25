import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Renders each sound offline in the browser, checks it is audible, unclipped and free of
// glitches, and saves a WAV to audio-previews/ so a person can actually listen to it.
test.use({ baseURL: 'http://localhost:5174' })

const RATE = 44100
interface Render {
  name: string
  peak: number
  rms: number
  bad: number // NaN/Infinity samples
  left: number[]
  right: number[]
}

function wav(left: number[], right: number[]): Buffer {
  const n = left.length
  const buf = Buffer.alloc(44 + n * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40)
  const clamp = (v: number) => Math.max(-1, Math.min(1, v)) * 32767
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(clamp(left[i]), 44 + i * 4)
    buf.writeInt16LE(clamp(right[i]), 46 + i * 4)
  }
  return buf
}

test('every sound renders cleanly at a gentle level', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  const renders: Render[] = await page.evaluate(async (RATE) => {
    // The sounds are randomised; a fixed seed makes every run render exactly the same audio,
    // so a failure means the code changed, not that the dice landed badly.
    let seed = 12345
    Math.random = () => {
      seed = (seed + 0x6d2b79f5) >>> 0
      let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const { createLayer, LAYERS } = await import('/src/audio/ambience.ts')
    const { Notes } = await import('/src/audio/notes.ts')
    const { Music } = await import('/src/audio/music.ts')

    const render = async (name: string, seconds: number, build: (ctx: OfflineAudioContext) => void) => {
      const ctx = new OfflineAudioContext(2, RATE * seconds, RATE)
      build(ctx)
      const out = await ctx.startRendering()
      const l = out.getChannelData(0), r = out.getChannelData(1)
      let peak = 0, sum = 0, bad = 0
      for (let i = 0; i < l.length; i++) {
        for (const v of [l[i], r[i]]) {
          if (!Number.isFinite(v)) bad++
          else { peak = Math.max(peak, Math.abs(v)); sum += v * v }
        }
      }
      return { name, peak, rms: Math.sqrt(sum / (l.length * 2)), bad, left: Array.from(l), right: Array.from(r) }
    }

    const results = []
    for (const name of LAYERS) {
      results.push(await render(name, 12, (ctx) => {
        const layer = createLayer(ctx, name, ctx.destination)
        layer.out.gain.value = 1
        layer.schedule(0, 12)
      }))
    }
    results.push(await render('music', 30, (ctx) => {
      const music = new Music(ctx, ctx.destination)
      music.start()
      music.schedule(0, 30)
    }))
    results.push(await render('notes', 6, (ctx) => {
      const notes = new Notes(ctx, ctx.destination)
      // A five-letter swipe, then the word chord, a bonus sparkle, and the level-complete arpeggio.
      for (let i = 0; i < 5; i++) notes.strike([392, 440, 523.25, 587.33, 659.25][i], 0.1 + i * 0.18, 0.42)
      const chord = [523.25, 659.25, 783.99, 1046.5]
      chord.forEach((f, i) => notes.strike(f, 1.2 + i * 0.035, 0.26, 1.7))
      ;[1318.51, 1567.98, 2093].forEach((f, i) => notes.strike(f, 2.8 + i * 0.06, 0.15, 0.9))
      ;[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => notes.strike(f, 3.8 + i * 0.13, 0.24, 2.4))
    }))
    return results
  }, RATE)

  mkdirSync('audio-previews', { recursive: true })
  const report: string[] = []
  for (const r of renders) {
    writeFileSync(`audio-previews/${r.name}.wav`, wav(r.left, r.right))
    const db = (v: number) => (20 * Math.log10(v)).toFixed(1)
    report.push(`${r.name.padEnd(9)} peak ${db(r.peak).padStart(6)} dB   rms ${db(r.rms).padStart(6)} dB`)
  }
  console.log('\n' + report.join('\n'))

  for (const r of renders) {
    expect(r.bad, `${r.name}: NaN or infinite samples`).toBe(0)
    expect(r.peak, `${r.name}: clips`).toBeLessThan(0.95)
    expect(r.rms, `${r.name}: too quiet to hear`).toBeGreaterThan(0.003)
  }
  // Steady nature layers should be balanced against each other (within 5 dB of -18 dB; gusts and waves vary run to run).
  const dbRms = (name: string) => 20 * Math.log10(renders.find((r) => r.name === name)!.rms)
  for (const name of ['rain', 'creek', 'waves', 'wind', 'fire']) {
    expect(dbRms(name), `${name} is out of balance`).toBeGreaterThan(-24)
    expect(dbRms(name), `${name} is out of balance`).toBeLessThan(-13)
  }
})
