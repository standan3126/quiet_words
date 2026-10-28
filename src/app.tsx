import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { loadLevel } from './game/levels'
import { bridge, frame, panel, settings as panelSettings } from './hub'
import { addToAlbum, createAlbum, deleteAlbum, loadAlbums, removeFromAlbum, renameAlbum, type Album } from './meta/albums'
import { defaultProgress, fromSaved, loadProgress, saveProgress, type Progress } from './meta/progress'
import type { Settings } from './meta/settings'
import { Journey } from './modes/journey'
import { pickScene } from './theme/scenery'
import { AlbumsScreen, type AlbumActions } from './ui/albums'
import { Home } from './ui/home'
import { Postcards } from './ui/postcards'
import { SceneBackdrop } from './ui/scene-backdrop'

// home is the launch page (Hub top left); the others are play pages (Home top left). Settings is
// GameHub's shared panel, opened by the gear on every page (hub.ts).
export type Screen = 'home' | 'play' | 'levels' | 'albums'

const snapshot = (): Settings => ({ ...panelSettings() })

export function App() {
  const [settings, setSettings] = useState<Settings>(snapshot)
  const [progress, setProgress] = useState<Progress>(defaultProgress)
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<Screen>('home')
  const [place, setPlace] = useState<{ journey: string; packId: number; name: string }>({ journey: 'Meadow', packId: 1, name: 'Clover Hill' })
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    loadAlbums().then(setAlbums)
    loadProgress().then((p) => {
      setProgress(p)
      setReady(true)
    })
  }, [])

  // What the shared panel needs from the screen, kept current on every render.
  bridge.progress = progress
  bridge.albumsWithPhotos = () => albums.filter((a) => a.photoIds.length).map((a) => a.id)
  bridge.onSettings = () => setSettings(snapshot())
  bridge.goHome = () => setScreen('home')
  bridge.openAlbums = () => {
    panel.close()
    setScreen('albums')
  }
  // A fresh start on the chosen level: no half-played board, revisit or waiting little game.
  bridge.setProgress = (level, coins) => setProgress((p) => ({ ...p, level, coins, current: null, revisit: null, pendingBreak: null }))
  bridge.restoreProgress = (p) => setProgress(fromSaved(p))

  useEffect(() => {
    frame.setPage(screen === 'home' ? 'launch' : 'play')
    // Levels and albums scroll under the frame; the page fades out before Home and the gear.
    document.body.classList.toggle('hub-scrolls', screen === 'levels' || screen === 'albums')
  }, [screen])

  // Save after every change (every word found), but never overwrite saved progress
  // with the defaults before it has loaded.
  const loaded = useRef(false)
  useEffect(() => {
    if (!ready) return
    if (loaded.current) saveProgress(progress)
    loaded.current = true
  }, [progress, ready])

  // Scenery and nature sounds follow the location the player is at, or is visiting again.
  const activeLevel = progress.revisit?.level ?? progress.level
  useEffect(() => {
    if (ready) loadLevel(activeLevel).then((l) => l && setPlace({ journey: l.pack.journey, packId: l.pack.id, name: l.pack.name }))
  }, [activeLevel, ready])

  // The panel's Light (Day, Night, or Auto by the clock) decides; it tells us when Auto turns.
  const theme = panel.night ? 'night' : 'day'

  // The nature sounds follow the place (unless the player made their own mix in Settings).
  useEffect(() => {
    bridge.journey = place.journey
    panel.applySound()
  }, [place.journey, theme])

  const scene = useMemo(
    () =>
      pickScene({
        ...place,
        theme,
        mode: settings.sceneryMode,
        albumPhotos: albums.find((a) => a.id === settings.activeAlbum)?.photoIds ?? [],
      }),
    [place, theme, settings.sceneryMode, settings.activeAlbum, albums],
  )

  const update = (patch: Partial<Settings>) => panel.set(patch)

  const albumActions: AlbumActions = {
    create: async (name) => {
      const next = await createAlbum(name)
      setAlbums(next)
      return next
    },
    rename: async (id, name) => setAlbums(await renameAlbum(id, name)),
    remove: async (id) => {
      setAlbums(await deleteAlbum(id))
      if (settings.activeAlbum === id) update({ activeAlbum: null, sceneryMode: 'painted' })
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

  const play = () => setScreen('play')

  return (
    <>
      {(screen === 'home' || screen === 'play') && (
        <SceneBackdrop scene={scene} journey={place.journey} packId={place.packId} place={place.name} theme={theme} motion={settings.sceneMotion} />
      )}
      {screen === 'home' && (
        <Home ready={ready} level={progress.level} revisiting={progress.revisit ? place.name : null} onPlay={play} onLevels={() => setScreen('levels')} />
      )}
      {screen === 'play' && (
        <Journey
          progress={progress}
          settings={settings}
          onProgress={setProgress}
          onHome={() => setScreen('home')}
          onPostcards={() => setScreen('levels')}
        />
      )}
      {screen === 'levels' && (
        <Postcards
          progress={progress}
          theme={theme}
          onJourney={() => {
            // Back to the journey leaves the revisit behind.
            setProgress((p) => ({ ...p, revisit: null }))
            play()
          }}
          onRevisit={(pack) => {
            setProgress((p) => ({ ...p, revisit: { packId: pack.id, level: pack.firstLevel, current: null } }))
            play()
          }}
        />
      )}
      {screen === 'albums' && <AlbumsScreen albums={albums} settings={settings} actions={albumActions} onChange={update} />}
    </>
  )
}
