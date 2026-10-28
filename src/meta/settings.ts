import type { SceneryMode } from '../theme/scenery'
import { ALL_BREAK_KINDS, DEFAULT_BREAK_EVERY, type BreakKind } from './breaks'
import { load, remove } from './storage'

// Since 2026-10-28 Quiet Words uses GameHub's shared Settings panel (hub/shared/v1/settings.js),
// which owns Light, the sound sliders, music style, nature sounds and the sleep timer, follows
// GameHub's settings, and saves in localStorage under "quiet-words:". These are its settings,
// shared ones and Quiet Words' own.
export interface Settings {
  light: 'day' | 'night' | 'auto'
  nightStart: string // "HH:MM"
  nightEnd: string
  volumes: { notes: number; nature: number; music: number }
  muted: boolean
  music: string // 'quiet-words' (its own music) or a GameHub music style
  nature: Record<string, number> | null // the player's own mix; null follows each place
  sceneryMode: SceneryMode // daytime only; night is always the painted night scene
  activeAlbum: string | null // the album shown when sceneryMode is 'album'
  sceneMotion: boolean // bees, birds and fluff by day; fireflies at night
  relaxedHints: boolean
  largeText: boolean
  haptics: boolean
  breakEvery: number // levels between little games; 0 for none
  breakKinds: BreakKind[] // which little games come up
}

// Quiet Words' starting points (GameHub's settings come on top of these, then the player's own).
export const GAME_DEFAULTS = {
  light: 'auto',
  volumes: { notes: 0.6, nature: 0.5, music: 0.35 },
  nature: null,
  sceneryMode: 'painted',
  activeAlbum: null,
  sceneMotion: true,
  relaxedHints: true,
  largeText: false,
  haptics: false,
  breakEvery: DEFAULT_BREAK_EVERY,
  breakKinds: ALL_BREAK_KINDS,
}

// Settings saved before 2026-10-28 (Quiet Words' own screen, in IndexedDB) in the panel's names.
export interface OldSettings {
  themeMode?: 'auto' | 'day' | 'night'
  nightStart?: string
  nightEnd?: string
  volumeNotes?: number
  volumeAmbience?: number
  volumeMusic?: number
  muted?: boolean
  ambienceMode?: 'scene' | 'custom'
  ambienceMix?: Record<string, number>
  sceneryMode?: string
  activeAlbum?: string | null
  sceneMotion?: boolean
  relaxedHints?: boolean
  largeText?: boolean
  haptics?: boolean
  breakEvery?: number
  breakKinds?: BreakKind[]
}

export function fromOldSettings(old: OldSettings): Record<string, unknown> {
  const { themeMode, volumeNotes, volumeAmbience, volumeMusic, ambienceMode, ambienceMix, sceneryMode, ...rest } = old
  const out: Record<string, unknown> = { ...rest }
  if (themeMode) out.light = themeMode
  const volumes = { notes: volumeNotes, nature: volumeAmbience, music: volumeMusic }
  out.volumes = Object.fromEntries(Object.entries(volumes).filter(([, v]) => v !== undefined))
  if (ambienceMode === 'custom' && ambienceMix) out.nature = ambienceMix
  // The AI nature photos ("builtin", once "default") were retired on 2026-10-28.
  out.sceneryMode = sceneryMode === 'album' || sceneryMode === 'mine' || sceneryMode === 'both' ? 'album' : 'painted'
  return out
}

// Hands old settings to the panel once, before it starts: the panel keeps only what differs from
// the defaults (as changes made in Quiet Words) and stores them its own way.
export async function moveOldSettings(store: { get<T>(key: string, fallback?: T): T; set(key: string, value: unknown): boolean }) {
  const old = await load<OldSettings | null>('settings', null)
  if (!old) return
  if (!store.get('my-settings', null) && !store.get('settings', null)) store.set('settings', fromOldSettings(old))
  await remove('settings')
}
