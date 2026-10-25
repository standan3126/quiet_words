import type { Mix } from '../audio/ambience'
import type { SceneryMode } from '../theme/scenery'
import { load, save } from './storage'

export type ThemeMode = 'auto' | 'day' | 'night'

export interface Settings {
  themeMode: ThemeMode
  nightStart: string // "HH:MM"
  nightEnd: string
  volumeNotes: number // 0..1
  volumeAmbience: number
  volumeMusic: number
  muted: boolean
  ambienceMode: 'scene' | 'custom' // follow each location's sounds, or the player's own mix
  ambienceMix: Mix
  sceneryMode: SceneryMode // daytime only; night is always the painted night scene
  activeAlbum: string | null // the album shown when sceneryMode is 'album'
  sceneMotion: boolean // bees, birds and fluff by day; fireflies at night
  relaxedHints: boolean
  largeText: boolean
  haptics: boolean
}

export const defaultSettings: Settings = {
  themeMode: 'auto',
  nightStart: '20:00',
  nightEnd: '07:00',
  volumeNotes: 0.6,
  volumeAmbience: 0.5,
  volumeMusic: 0.35,
  muted: false,
  ambienceMode: 'scene',
  ambienceMix: { rain: 0.6, wind: 0.2 },
  sceneryMode: 'builtin',
  activeAlbum: null,
  sceneMotion: true,
  relaxedHints: true,
  largeText: false,
  haptics: false,
}

const KEY = 'settings'

export async function loadSettings(): Promise<Settings> {
  const stored = await load<Partial<Settings> & { sceneryMode?: string; photosAtNight?: boolean }>(KEY, {})
  // Scenery options from before albums: "default" pictures, "mine", or "both".
  const legacy: Record<string, SceneryMode> = { default: 'builtin', mine: 'album', both: 'album' }
  const sceneryMode = (stored.sceneryMode && legacy[stored.sceneryMode]) || stored.sceneryMode
  const { photosAtNight: _dropped, ...rest } = stored
  return { ...defaultSettings, ...rest, ...(sceneryMode ? { sceneryMode: sceneryMode as SceneryMode } : {}) }
}

export function saveSettings(settings: Settings): Promise<void> {
  return save(KEY, settings)
}

function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Night window may wrap past midnight (e.g. 20:00 -> 07:00).
export function isNightTime(settings: Settings, now: Date): boolean {
  const t = now.getHours() * 60 + now.getMinutes()
  const start = minutes(settings.nightStart)
  const end = minutes(settings.nightEnd)
  return start <= end ? t >= start && t < end : t >= start || t < end
}

export function resolveTheme(settings: Settings, now: Date): 'day' | 'night' {
  if (settings.themeMode !== 'auto') return settings.themeMode
  return isNightTime(settings, now) ? 'night' : 'day'
}
