// Chooses the picture behind the home and play screens.
// Night is always the painted night scene: photos are too bright and busy for bedtime.

export interface SceneImage {
  file: string // in public/scenery/
  journey: string
}

export type SceneryMode = 'painted' | 'builtin' | 'album'

export type Scene =
  | { kind: 'painted'; journey: string; seed: number }
  | { kind: 'builtin'; file: string }
  | { kind: 'slideshow'; photoIds: string[] }

export interface SceneChoice {
  journey: string
  packId: number
  theme: 'day' | 'night'
  mode: SceneryMode
  albumPhotos: string[] // the chosen album's photos
  images: SceneImage[]
}

export function pickScene(c: SceneChoice): Scene {
  const painted: Scene = { kind: 'painted', journey: c.journey, seed: c.packId }
  if (c.theme === 'night') return painted
  if (c.mode === 'album' && c.albumPhotos.length) return { kind: 'slideshow', photoIds: c.albumPhotos }
  if (c.mode === 'builtin') {
    const pool = c.images.filter((i) => i.journey === c.journey)
    if (pool.length) return { kind: 'builtin', file: pool[c.packId % pool.length].file }
  }
  return painted
}
