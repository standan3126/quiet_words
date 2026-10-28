// Where Quiet Words plugs into GameHub (hub/shared/CONTRACT.md): the toolbox's Sound, the shared
// Settings panel (with Quiet Words' own sections), and the frame: Hub or Home top left, the gear
// top right. The app (app.tsx) fills in `bridge` so the panel can reach what's on screen.
import { gameFrame } from '@shared/kit.js'
import { gameStore } from '@shared/save.js'
import { choice, note, SettingsPanel, slider, toggle } from '@shared/settings.js'
import { Sound } from '@shared/sound/index.js'
import { sceneMix } from './audio/scenes'
import { BREAK_EVERY_STOPS, BREAK_KINDS, describeEvery } from './meta/breaks'
import type { Progress } from './meta/progress'
import { GAME_DEFAULTS, type Settings } from './meta/settings'

export const GAME_ID = 'quiet-words'
export const store = gameStore(GAME_ID)

// The same synthesised notes, music and nature sounds Quiet Words always had: the toolbox's
// copies are identical (checked 2026-10-28), and they also play GameHub's music styles.
export const sound = new Sound(GAME_DEFAULTS.volumes)

export const bridge: {
  journey?: string // where the player is, for the nature sounds
  progress?: Progress
  albumsWithPhotos?: () => string[] // ids of albums that have photos
  onSettings?: () => void
  openAlbums?: () => void
  goHome?: () => void
  setProgress?: (level: number, coins: number) => void
  restoreProgress?: (progress: Partial<Progress>) => void
} = {}

// The panel's settings, while it builds its sections (before `panel` is set).
const own = (p: SettingsPanel) => p.settings as unknown as Settings

const rowHint = (row: HTMLElement, text: string) => {
  const hint = row.querySelector('small')
  if (hint) hint.textContent = text
}

export let panel: SettingsPanel

export function startPanel() {
  panel = new SettingsPanel({
    gameId: GAME_ID,
    store,
    sound,
    notesLabel: 'Letter chimes',
    defaults: GAME_DEFAULTS,
    placeNature: () => sceneMix(bridge.journey, panel?.night ? 'night' : 'day'),
    look: (el, p) =>
      el.append(toggle({ label: 'Large text', checked: own(p).largeText, onToggle: (largeText) => p.set({ largeText }) })),
    sections: [
      {
        title: 'Daytime scenery',
        place: 'look',
        build: (el, p) => {
          const albums = document.createElement('button')
          albums.type = 'button'
          albums.className = 'hub-small-button'
          albums.textContent = 'Photo albums ›'
          albums.addEventListener('click', () => bridge.openAlbums?.())
          el.append(
            choice({
              label: 'Daytime scenery',
              value: own(p).sceneryMode,
              options: [
                { value: 'painted', label: 'Painted' },
                { value: 'album', label: 'My album' },
              ],
              onPick: (mode) => {
                // "My album" with none picked yet uses the first album that has photos.
                const ids = bridge.albumsWithPhotos?.() ?? []
                if (mode === 'album' && !ids.includes(own(p).activeAlbum ?? '')) {
                  if (!ids.length) return bridge.openAlbums?.()
                  return p.set({ sceneryMode: mode, activeAlbum: ids[0] })
                }
                p.set({ sceneryMode: mode })
              },
            }),
            albums,
            toggle({
              label: 'Moving scenery',
              hint: 'Lazy bees, birds and drifting fluff by day; fireflies at night',
              checked: own(p).sceneMotion,
              onToggle: (sceneMotion) => p.set({ sceneMotion }),
            }),
            note('At night the painted night scene always shows.'),
          )
        },
      },
      {
        title: 'Play',
        build: (el, p) =>
          el.append(
            toggle({
              label: 'Relaxed hints',
              hint: 'A free hint glows if you’ve been stuck a while',
              checked: own(p).relaxedHints,
              onToggle: (relaxedHints) => p.set({ relaxedHints }),
            }),
            toggle({ label: 'Gentle vibration', checked: own(p).haptics, onToggle: (haptics) => p.set({ haptics }) }),
          ),
      },
      {
        title: 'Little games',
        build: (el, p) => {
          const s = own(p)
          // A saved value between the stops shows at the nearest one.
          const stop = BREAK_EVERY_STOPS.reduce((best, v, i) => (Math.abs(v - s.breakEvery) < Math.abs(BREAK_EVERY_STOPS[best] - s.breakEvery) ? i : best), 0)
          const often = slider({
            label: 'How often',
            hint: describeEvery(s.breakEvery),
            value: stop,
            min: 0,
            max: BREAK_EVERY_STOPS.length - 1,
            step: 1,
            onInput: (i) => {
              p.set({ breakEvery: BREAK_EVERY_STOPS[i] })
              rowHint(often, describeEvery(BREAK_EVERY_STOPS[i]))
            },
          })
          el.append(
            often,
            ...BREAK_KINDS.map(({ kind, label, hint }) =>
              toggle({
                label,
                hint,
                checked: own(p).breakKinds.includes(kind),
                onToggle: (on) => {
                  const kinds = own(p).breakKinds.filter((k) => k !== kind)
                  p.set({ breakKinds: on ? [...kinds, kind] : kinds })
                },
              }),
            ),
          )
        },
      },
    ],
    manual: {
      fields: [
        { id: 'level', label: 'Level', min: 1, get: () => bridge.progress?.level ?? 1 },
        { id: 'coins', label: 'Coins', get: () => bridge.progress?.coins ?? 0 },
      ],
      onSet: ({ level, coins }) => {
        bridge.setProgress?.(level, coins)
        return `Set: level ${level}, ${coins} coins.`
      },
    },
    // A code or backup holds the settings and progress; photos stay on this phone.
    exportData: () => ({ ...store.all(), progress: bridge.progress }),
    onRestore: (data) => {
      store.remove('progress')
      if (data.progress) bridge.restoreProgress?.(data.progress as Partial<Progress>)
    },
    onChange: () => bridge.onSettings?.(),
    credits: [
      'Quiet Words was made for GameHub. The puzzles, the painted places and the little games were all made for this game.',
      'Words: the ENABLE2K word list (public domain, via github.com/dolph/dictionary) and the SCOWL American English word list (wordlist.aspell.net, SCOWL license).',
      'Which words are everyday: FrequencyWords by Hermit Dave (github.com/hermitdave/FrequencyWords, from OpenSubtitles 2018, CC BY-SA 4.0).',
      'Meanings: WordNet 3.1, Princeton University (WordNet license).',
      'Words kept out of puzzles: the List of Dirty, Naughty, Obscene and Otherwise Bad Words (github.com/LDNOOBW, CC BY 4.0).',
      'Every sound and all the music are made in code by the GameHub toolbox. Nothing is borrowed.',
    ],
  })
  return panel
}

export const settings = () => panel.settings as unknown as Settings

export const frame = gameFrame({
  onSettings: () => panel.open(),
  onHome: () => bridge.goHome?.(),
})
