import { describe, expect, it } from 'vitest'
import { pickScene, sceneTime, type SceneChoice, type SceneImage } from './scenery'

const base: SceneChoice = { journey: 'Coast', packId: 3, theme: 'day', mode: 'builtin', albumPhotos: [], images: [], time: 'day' }
const images = [
  { file: 'coast-1.jpg', journey: 'Coast' },
  { file: 'coast-2.jpg', journey: 'Coast' },
  { file: 'meadow-1.jpg', journey: 'Meadow' },
]
const timed: SceneImage[] = [
  { file: 'meadow-1.jpg', journey: 'Meadow', time: 'day' },
  { file: 'meadow-2.jpg', journey: 'Meadow', time: 'dusk' },
  { file: 'meadow-3.jpg', journey: 'Meadow', time: 'day' },
]

describe('pickScene', () => {
  it('uses the painted scene when there are no pictures', () => {
    expect(pickScene(base)).toEqual({ kind: 'painted', journey: 'Coast', seed: 3 })
    expect(pickScene({ ...base, mode: 'painted', images })).toEqual({ kind: 'painted', journey: 'Coast', seed: 3 })
  })

  it("rotates through the journey's built-in pictures by location", () => {
    expect(pickScene({ ...base, images })).toEqual({ kind: 'builtin', file: 'coast-2.jpg' })
    expect(pickScene({ ...base, images, packId: 4 })).toEqual({ kind: 'builtin', file: 'coast-1.jpg' })
  })

  it('shows the golden-hour picture from 5pm, and the daytime ones before', () => {
    const meadow = { ...base, journey: 'Meadow', images: timed }
    expect(pickScene({ ...meadow, packId: 1 })).toEqual({ kind: 'builtin', file: 'meadow-3.jpg' })
    expect(pickScene({ ...meadow, packId: 2 })).toEqual({ kind: 'builtin', file: 'meadow-1.jpg' })
    expect(pickScene({ ...meadow, time: 'dusk' })).toEqual({ kind: 'builtin', file: 'meadow-2.jpg' })
    expect(sceneTime(new Date(2026, 9, 25, 16, 59))).toBe('day')
    expect(sceneTime(new Date(2026, 9, 25, 17, 0))).toBe('dusk')
  })

  it('falls back to any picture when a journey has none for the time of day', () => {
    expect(pickScene({ ...base, images, time: 'dusk' })).toEqual({ kind: 'builtin', file: 'coast-2.jpg' })
  })

  it('plays the chosen album as a slideshow, or the painted scene if it is empty', () => {
    expect(pickScene({ ...base, mode: 'album', albumPhotos: ['a', 'b'] })).toEqual({ kind: 'slideshow', photoIds: ['a', 'b'] })
    expect(pickScene({ ...base, mode: 'album' }).kind).toBe('painted')
  })

  it('always shows the painted scene at night', () => {
    expect(pickScene({ ...base, theme: 'night', images }).kind).toBe('painted')
    expect(pickScene({ ...base, theme: 'night', mode: 'album', albumPhotos: ['a'] }).kind).toBe('painted')
  })
})
