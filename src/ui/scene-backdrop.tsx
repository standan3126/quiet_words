import { useEffect, useState } from 'preact/hooks'
import { photoBlob } from '../meta/photos'
import { SceneMotion } from '../theme/motion'
import { PaintedScene } from '../theme/painted'
import type { Scene } from '../theme/scenery'

const base = import.meta.env.BASE_URL
export const SLIDE_SECONDS = 45

// An album as a slow slideshow: each photo stays 45 seconds, then the next fades in over it.
function Slideshow({ photoIds }: { photoIds: string[] }) {
  const [slides, setSlides] = useState<{ url: string; key: number }[]>([])
  const ids = photoIds.join(',')

  useEffect(() => {
    let live = true
    let count = 0
    let next = Math.floor(Math.random() * photoIds.length) // a different first photo each time
    const shown: string[] = []

    const show = async () => {
      const blob = await photoBlob(photoIds[next++ % photoIds.length])
      if (!blob || !live) return
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.src = url
      await img.decode().catch(() => {}) // fully loaded before it starts to fade in
      if (!live) return URL.revokeObjectURL(url)
      shown.push(url)
      // Two layers are enough: the new photo fades in over the one before it.
      while (shown.length > 2) setTimeout(URL.revokeObjectURL, 1000, shown.shift())
      setSlides((s) => [...s, { url, key: count++ }].slice(-2))
    }

    show()
    const timer = photoIds.length > 1 ? setInterval(show, SLIDE_SECONDS * 1000) : undefined
    return () => {
      live = false
      clearInterval(timer)
      shown.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [ids])

  return (
    <>
      {slides.map((s) => (
        <img key={s.key} class="scene-media slide" src={s.url} alt="" />
      ))}
    </>
  )
}

interface Props {
  scene: Scene
  journey: string // for the painted scene if a picture won't load
  packId: number
  theme: 'day' | 'night'
  motion: boolean
}

// The picture behind the home and play screens, plus a soft shade that keeps text readable.
export function SceneBackdrop({ scene, journey, packId, theme, motion }: Props) {
  const [failed, setFailed] = useState(false) // a built-in picture that wouldn't load
  const file = scene.kind === 'builtin' ? scene.file : ''
  useEffect(() => setFailed(false), [file])

  const painted = scene.kind === 'painted' || failed
  const seed = packId
  return (
    <div class={`scene${painted ? ' painted' : ''}`} aria-hidden="true">
      {painted && <PaintedScene journey={journey} seed={seed} night={theme === 'night'} />}
      {!painted && scene.kind === 'builtin' && <img class="scene-media" src={`${base}scenery/${scene.file}`} alt="" key={scene.file} onError={() => setFailed(true)} />}
      {!painted && scene.kind === 'slideshow' && <Slideshow photoIds={scene.photoIds} />}
      <div class="scene-shade" />
      {painted && motion && <SceneMotion seed={seed} night={theme === 'night'} />}
    </div>
  )
}
