import { describe, expect, it } from 'vitest'
import { pickScene, type SceneChoice } from './scenery'

const base: SceneChoice = { journey: 'Coast', packId: 3, theme: 'day', mode: 'builtin', albumPhotos: [], images: [] }
const images = [
  { file: 'coast-1.jpg', journey: 'Coast' },
  { file: 'coast-2.jpg', journey: 'Coast' },
  { file: 'meadow-1.jpg', journey: 'Meadow' },
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

  it('plays the chosen album as a slideshow, or the painted scene if it is empty', () => {
    expect(pickScene({ ...base, mode: 'album', albumPhotos: ['a', 'b'] })).toEqual({ kind: 'slideshow', photoIds: ['a', 'b'] })
    expect(pickScene({ ...base, mode: 'album' }).kind).toBe('painted')
  })

  it('always shows the painted scene at night', () => {
    expect(pickScene({ ...base, theme: 'night', images }).kind).toBe('painted')
    expect(pickScene({ ...base, theme: 'night', mode: 'album', albumPhotos: ['a'] }).kind).toBe('painted')
  })
})
