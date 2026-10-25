import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { audio } from './audio/engine'
import { loadLevel } from './game/levels'
import { addToAlbum, createAlbum, deleteAlbum, loadAlbums, removeFromAlbum, renameAlbum, type Album } from './meta/albums'
import { defaultProgress, loadProgress, saveProgress, type Progress } from './meta/progress'
import { defaultSettings, loadSettings, resolveTheme, saveSettings, type Settings } from './meta/settings'
import { Daily } from './modes/daily'
import { Journey } from './modes/journey'
import { pickScene, type SceneImage } from './theme/scenery'
import { loadSceneryImages } from './theme/scenery-images'
import { AlbumsScreen, type AlbumActions } from './ui/albums'
import { todayKey } from './game/daily'
import { Home } from './ui/home'
import { Postcards } from './ui/postcards'
import { SceneBackdrop } from './ui/scene-backdrop'
import { SettingsScreen } from './ui/settings'
import type { SleepMinutes } from './ui/sleep-timer'

export type Screen = 'home' | 'play' | 'daily' | 'postcards' | 'settings' | 'albums'

export interface Sleep {
  minutes: SleepMinutes
  phase: 'awake' | 'fading' | 'asleep'
}

export function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [progress, setProgress] = useState<Progress>(defaultProgress)
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<Screen>('home')
  const [now, setNow] = useState(() => new Date())
  const [place, setPlace] = useState<{ journey: string; packId: number }>({ journey: 'Meadow', packId: 1 })
  const [albums, setAlbums] = useState<Album[]>([])
  const [images, setImages] = useState<SceneImage[]>([])
  const [sleep, setSleep] = useState<Sleep>({ minutes: null, phase: 'awake' })

  useEffect(() => {
    loadAlbums().then(setAlbums)
    loadSceneryImages().then(setImages)
    Promise.all([loadSettings(), loadProgress()]).then(([s, p]) => {
      setSettings(s)
      setProgress(p)
      setReady(true)
    })
    // Re-check the clock each minute so auto night mode switches on its own.
    const id = setInterval(() => setNow(new Date()), 60_000)
    // Browsers only let audio start from a tap. Every tap also resumes audio after a phone
    // call or other interruption has paused it.
    const unlock = () => audio.unlock()
    window.addEventListener('pointerdown', unlock, { capture: true })
    return () => {
      clearInterval(id)
      window.removeEventListener('pointerdown', unlock, { capture: true })
    }
  }, [])

  // Save after every change (every word found), but never overwrite saved progress
  // with the defaults before it has loaded.
  const loaded = useRef(false)
  useEffect(() => {
    if (!ready) return
    if (loaded.current) saveProgress(progress)
    loaded.current = true
  }, [progress, ready])

  // Scenery and nature sounds follow the location the player is at.
  useEffect(() => {
    if (ready) loadLevel(progress.level).then((l) => l && setPlace({ journey: l.pack.journey, packId: l.pack.id }))
  }, [progress.level, ready])

  const theme = resolveTheme(settings, now)

  useEffect(() => audio.update(settings, { journey: place.journey, theme }), [settings, place.journey, theme])

  const scene = useMemo(
    () =>
      pickScene({
        ...place,
        theme,
        mode: settings.sceneryMode,
        albumPhotos: albums.find((a) => a.id === settings.activeAlbum)?.photoIds ?? [],
        images,
      }),
    [place, theme, settings.sceneryMode, settings.activeAlbum, albums, images],
  )

  const albumActions: AlbumActions = {
    create: async (name) => {
      const next = await createAlbum(name)
      setAlbums(next)
      return next
    },
    rename: async (id, name) => setAlbums(await renameAlbum(id, name)),
    remove: async (id) => {
      setAlbums(await deleteAlbum(id))
      if (settings.activeAlbum === id) update({ activeAlbum: null, sceneryMode: 'builtin' })
    },
    addPhotos: async (id, files) => {
      const result = await addToAlbum(id, files)
      setAlbums(result.albums)
      return result
    },
    removePhoto: async (albumId, photoId) => setAlbums(await removeFromAlbum(albumId, photoId)),
  }

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle('large-text', settings.largeText)
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'night' ? '#120800' : '#efe9dc')
  }, [theme, settings.largeText])

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  const setSleepTimer = (minutes: SleepMinutes) => {
    if (minutes === null) {
      audio.wake()
      return setSleep({ minutes: null, phase: 'awake' })
    }
    audio.sleepIn(
      minutes,
      () => setSleep((s) => ({ ...s, phase: 'fading' })),
      () => setSleep((s) => ({ ...s, phase: 'asleep' })),
    )
    setSleep({ minutes, phase: 'awake' })
  }

  return (
    <>
      {(screen === 'home' || screen === 'play' || screen === 'daily') && (
        <SceneBackdrop scene={scene} journey={place.journey} packId={place.packId} theme={theme} motion={settings.sceneMotion} />
      )}
      {screen === 'home' && (
        <Home
          theme={theme}
          ready={ready}
          level={progress.level}
          dailyDone={progress.flowers.includes(todayKey(now))}
          onNavigate={setScreen}
          onToggleTheme={() => update({ themeMode: theme === 'night' ? 'day' : 'night' })}
        />
      )}
      {(screen === 'play' || screen === 'daily') &&
        (() => {
          const shared = {
            progress,
            settings,
            sleepMinutes: sleep.minutes,
            onProgress: setProgress,
            onSettings: update,
            onSleep: setSleepTimer,
            onHome: () => setScreen('home'),
          }
          return screen === 'play' ? <Journey {...shared} /> : <Daily {...shared} />
        })()}
      {screen === 'postcards' && <Postcards progress={progress} theme={theme} onBack={() => setScreen('home')} />}
      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          sleepMinutes={sleep.minutes}
          albums={albums}
          hasBuiltIn={images.length > 0}
          onChange={update}
          onSleep={setSleepTimer}
          onAlbums={() => setScreen('albums')}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'albums' && (
        <AlbumsScreen albums={albums} settings={settings} actions={albumActions} onChange={update} onBack={() => setScreen('settings')} />
      )}
      {/* The screen dims along with the sound. A tap at any point cancels it. */}
      {sleep.phase !== 'awake' && (
        <div class={`sleep-dim ${sleep.phase}`} onClick={() => setSleepTimer(null)}>
          {sleep.phase === 'asleep' && <p>Sleep well · tap to wake</p>}
        </div>
      )}
    </>
  )
}
