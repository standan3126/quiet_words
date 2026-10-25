import type { Album } from '../meta/albums'
import type { Settings } from '../meta/settings'
import type { SceneryMode } from '../theme/scenery'

interface Props {
  settings: Settings
  albums: Album[]
  hasBuiltIn: boolean
  onChange: (patch: Partial<Settings>) => void
  onAlbums: () => void
}

const modes: { value: SceneryMode; label: string }[] = [
  { value: 'painted', label: 'Painted' },
  { value: 'builtin', label: 'Nature' },
  { value: 'album', label: 'My album' },
]

export function ScenerySettings({ settings, albums, hasBuiltIn, onChange, onAlbums }: Props) {
  const active = albums.find((a) => a.id === settings.activeAlbum)
  const choose = (mode: SceneryMode) => {
    // Choosing "My album" with none picked yet uses the first album that has photos.
    if (mode === 'album' && !active) {
      const first = albums.find((a) => a.photoIds.length)
      if (!first) return onAlbums()
      return onChange({ sceneryMode: mode, activeAlbum: first.id })
    }
    onChange({ sceneryMode: mode })
  }

  return (
    <section class="panel">
      <h3>Daytime scenery</h3>
      <div class="segmented" role="radiogroup" aria-label="Daytime scenery">
        {modes.map((m) => (
          <button role="radio" aria-checked={settings.sceneryMode === m.value} class={settings.sceneryMode === m.value ? 'selected' : ''} onClick={() => choose(m.value)}>
            {m.label}
          </button>
        ))}
      </div>
      {settings.sceneryMode === 'builtin' && !hasBuiltIn && <p class="soft note">No nature pictures yet, so the painted scene shows for now.</p>}
      {settings.sceneryMode === 'album' && active && <p class="soft note">Showing "{active.name}", one photo every 45 seconds.</p>}
      <button class="add-photos" onClick={onAlbums}>
        Photo albums ›
      </button>
      <label class="row">
        <span>
          Moving scenery
          <small class="soft">Lazy bees, birds and drifting fluff by day; fireflies at night</small>
        </span>
        <input type="checkbox" checked={settings.sceneMotion} onChange={(e) => onChange({ sceneMotion: (e.target as HTMLInputElement).checked })} />
      </label>
      <p class="soft note">At night the painted night scene always shows. Photos are too bright for bedtime.</p>
    </section>
  )
}
