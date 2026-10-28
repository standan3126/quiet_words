import { describe, expect, it } from 'vitest'
import { pickScene, type SceneChoice } from './scenery'

const base: SceneChoice = { journey: 'Coast', packId: 3, theme: 'day', mode: 'painted', albumPhotos: [] }

describe('pickScene', () => {
  it('paints the place', () => {
    expect(pickScene(base)).toEqual({ kind: 'painted', journey: 'Coast', seed: 3 })
  })

  it("shows the player's album by day, painted when the album is empty", () => {
    expect(pickScene({ ...base, mode: 'album', albumPhotos: ['a', 'b'] })).toEqual({ kind: 'slideshow', photoIds: ['a', 'b'] })
    expect(pickScene({ ...base, mode: 'album' })).toEqual({ kind: 'painted', journey: 'Coast', seed: 3 })
  })

  it('always paints the night scene at night', () => {
    expect(pickScene({ ...base, theme: 'night', mode: 'album', albumPhotos: ['a'] })).toEqual({ kind: 'painted', journey: 'Coast', seed: 3 })
  })
})
