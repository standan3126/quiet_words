// Chooses the picture behind the home and play screens: the painted place (code-drawn), or the
// player's own album by day. Night is always the painted night scene: photos are too bright and
// busy for bedtime. (The AI nature photos, "builtin", were retired on 2026-10-28.)

export type SceneryMode = 'painted' | 'album'

export type Scene = { kind: 'painted'; journey: string; seed: number } | { kind: 'slideshow'; photoIds: string[] }

export interface SceneChoice {
  journey: string
  packId: number
  theme: 'day' | 'night'
  mode: SceneryMode
  albumPhotos: string[] // the chosen album's photos
}

export function pickScene(c: SceneChoice): Scene {
  if (c.theme === 'day' && c.mode === 'album' && c.albumPhotos.length) return { kind: 'slideshow', photoIds: c.albumPhotos }
  return { kind: 'painted', journey: c.journey, seed: c.packId }
}
