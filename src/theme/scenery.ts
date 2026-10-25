// Chooses the picture behind the home and play screens.
// Night is always the painted night scene: photos are too bright and busy for bedtime.

export type SceneTime = 'day' | 'dusk'

export interface SceneImage {
  file: string // in public/scenery/
  journey: string
  time?: SceneTime // older manifests have none: treated as day
}

export const DUSK_HOUR = 17

// Golden-hour pictures from 5pm until night mode takes over.
export const sceneTime = (now: Date): SceneTime => (now.getHours() >= DUSK_HOUR ? 'dusk' : 'day')

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
  time: SceneTime
}

export function pickScene(c: SceneChoice): Scene {
  const painted: Scene = { kind: 'painted', journey: c.journey, seed: c.packId }
  if (c.theme === 'night') return painted
  if (c.mode === 'album' && c.albumPhotos.length) return { kind: 'slideshow', photoIds: c.albumPhotos }
  if (c.mode === 'builtin') {
    const pool = c.images.filter((i) => i.journey === c.journey)
    // Pictures for this time of day if the journey has any, otherwise whatever it has.
    const timed = pool.filter((i) => (i.time ?? 'day') === c.time)
    const pick = timed.length ? timed : pool
    if (pick.length) return { kind: 'builtin', file: pick[c.packId % pick.length].file }
  }
  return painted
}
