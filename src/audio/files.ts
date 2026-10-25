// Optional real recordings. Everything is synthesised by default; to use your own sounds,
// put audio files in public/audio/ and list them in public/audio/manifest.json:
//
//   {
//     "ambience": { "rain": "rain.ogg", "waves": "waves.mp3" },   // replaces that layer, looped
//     "music": ["evening.mp3", "harbor.mp3"]                      // replaces the generated music
//   }
//
// Recordings should be CC0 or otherwise licensed for your use. Loops should be seamless.
import type { LayerName } from './ambience'

export interface Manifest {
  ambience?: Partial<Record<LayerName, string>>
  music?: string[]
}

const base = `${import.meta.env.BASE_URL}audio/`

export async function loadManifest(): Promise<Manifest> {
  try {
    const res = await fetch(`${base}manifest.json`)
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

export async function loadBuffer(ctx: BaseAudioContext, file: string): Promise<AudioBuffer | undefined> {
  try {
    const res = await fetch(base + file)
    return res.ok ? await ctx.decodeAudioData(await res.arrayBuffer()) : undefined
  } catch {
    return undefined // a missing or unreadable file just falls back to the synthesised sound
  }
}
