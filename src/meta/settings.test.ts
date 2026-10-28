import { describe, expect, it } from 'vitest'
import { fromOldSettings } from './settings'

// The night window and Auto now live in GameHub's shared panel (hub/shared/v1/settings.js).
describe('settings from before the shared panel', () => {
  it('move to the panel names', () => {
    expect(
      fromOldSettings({ themeMode: 'night', volumeNotes: 0.4, volumeAmbience: 0.2, volumeMusic: 0, muted: true, largeText: true, breakEvery: 3 }),
    ).toEqual({ light: 'night', volumes: { notes: 0.4, nature: 0.2, music: 0 }, muted: true, largeText: true, breakEvery: 3, sceneryMode: 'painted' })
  })

  it('keep a custom nature mix, and follow each place otherwise', () => {
    expect(fromOldSettings({ ambienceMode: 'custom', ambienceMix: { rain: 0.6 } }).nature).toEqual({ rain: 0.6 })
    expect(fromOldSettings({ ambienceMode: 'scene', ambienceMix: { rain: 0.6 } }).nature).toBeUndefined()
  })

  it('show the painted scenery instead of the retired nature photos, and keep albums', () => {
    expect(fromOldSettings({ sceneryMode: 'builtin' }).sceneryMode).toBe('painted')
    expect(fromOldSettings({ sceneryMode: 'album', activeAlbum: 'a1' })).toMatchObject({ sceneryMode: 'album', activeAlbum: 'a1' })
  })
})
