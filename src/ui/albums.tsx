import { useEffect, useRef, useState } from 'preact/hooks'
import { ALBUM_LIMIT, type AddResult, type Album } from '../meta/albums'
import { photoBlob } from '../meta/photos'
import type { Settings } from '../meta/settings'

export interface AlbumActions {
  create: (name: string) => Promise<Album[]>
  rename: (id: string, name: string) => void
  remove: (id: string) => void
  addPhotos: (id: string, files: File[]) => Promise<AddResult>
  removePhoto: (albumId: string, photoId: string) => void
}

interface Props {
  albums: Album[]
  settings: Settings
  actions: AlbumActions
  onChange: (patch: Partial<Settings>) => void
}

function Thumb({ id, onRemove }: { id: string; onRemove?: () => void }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    let made: string | undefined
    photoBlob(id).then((b) => b && setUrl((made = URL.createObjectURL(b))))
    return () => made && URL.revokeObjectURL(made)
  }, [id])
  return (
    <div class="thumb">
      {url && <img src={url} alt="" />}
      {onRemove && (
        <button class="thumb-remove" onClick={onRemove} aria-label="Remove photo">
          ×
        </button>
      )}
    </div>
  )
}

function AlbumDetail({ album, active, actions, onUse, onClose }: { album: Album; active: boolean; actions: AlbumActions; onUse: () => void; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AddResult | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const room = ALBUM_LIMIT - album.photoIds.length

  const pick = async (e: Event) => {
    const el = e.target as HTMLInputElement
    const files = [...(el.files ?? [])]
    el.value = '' // allow picking the same files again
    if (!files.length) return
    setBusy(true)
    setResult(await actions.addPhotos(album.id, files))
    setBusy(false)
  }

  return (
    <section class="panel album-detail" aria-label={`Album ${album.name}`}>
      <input
        class="album-name"
        value={album.name}
        aria-label="Album name"
        onChange={(e) => {
          const name = (e.target as HTMLInputElement).value.trim()
          if (name) actions.rename(album.id, name)
        }}
      />
      <p class="soft note">
        {album.photoIds.length} of {ALBUM_LIMIT} photos
      </p>

      {album.photoIds.length > 0 && (
        <div class="thumbs">
          {album.photoIds.map((id) => (
            <Thumb key={id} id={id} onRemove={() => actions.removePhoto(album.id, id)} />
          ))}
        </div>
      )}

      {/* accept="image/*" lets phones offer the camera or the photo library. */}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={pick} />
      <button class="add-photos" onClick={() => input.current!.click()} disabled={busy || room <= 0}>
        {busy ? 'Adding…' : room > 0 ? `Add photos (${room} more fit)` : 'This album is full'}
      </button>

      {result && (
        <div class="notice" role="status">
          {result.added > 0 && <p>Added {result.added} photo{result.added === 1 ? '' : 's'}.</p>}
          {result.overLimit > 0 && (
            <p>
              Albums hold up to {ALBUM_LIMIT} photos, so {result.overLimit} {result.overLimit === 1 ? "wasn't" : "weren't"} added. You can start another album for more.
            </p>
          )}
          {result.failed > 0 && (
            <p>
              {result.failed} file{result.failed === 1 ? '' : 's'} couldn't be opened as a picture.
            </p>
          )}
          <button class="text-button" onClick={() => setResult(null)}>
            OK
          </button>
        </div>
      )}

      <button class="primary-button" onClick={onUse} disabled={active || !album.photoIds.length}>
        {active ? 'Showing as your background' : 'Use as background'}
      </button>
      {confirmDelete ? (
        <div class="confirm">
          <p>Delete "{album.name}" and its photos from this device?</p>
          <button class="text-button danger" onClick={() => actions.remove(album.id)}>
            Delete album
          </button>
          <button class="text-button" onClick={() => setConfirmDelete(false)}>
            Keep it
          </button>
        </div>
      ) : (
        <button class="text-button" onClick={() => setConfirmDelete(true)}>
          Delete album…
        </button>
      )}
      <button class="text-button" onClick={onClose}>
        Done
      </button>
    </section>
  )
}

export function AlbumsScreen({ albums, settings, actions, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const open = albums.find((a) => a.id === openId)
  const activeId = settings.sceneryMode === 'album' ? settings.activeAlbum : null

  const create = async () => {
    const next = await actions.create(name.trim() || 'New album')
    setOpenId(next[next.length - 1].id)
    setNaming(false)
    setName('')
  }

  return (
    <main class="screen albums">
      {/* Home (top left, from the toolbox frame) leaves; inside an album this goes back to the list. */}
      <header class="screen-header">
        <h2>Photo albums</h2>
      </header>
      {open && (
        <button class="text-button" onClick={() => setOpenId(null)}>
          ‹ All albums
        </button>
      )}

      {open ? (
        <AlbumDetail
          album={open}
          active={activeId === open.id}
          actions={actions}
          onUse={() => onChange({ sceneryMode: 'album', activeAlbum: open.id })}
          onClose={() => setOpenId(null)}
        />
      ) : (
        <>
          <p class="soft note">
            Pick an album to show behind the game during the day, one photo at a time, slowly fading from one to the next. Photos stay on this
            device and are never uploaded.
          </p>
          {albums.map((a) => (
            <button class="panel album-card" onClick={() => setOpenId(a.id)}>
              {a.photoIds[0] ? <Thumb id={a.photoIds[0]} /> : <div class="thumb empty" />}
              <span class="album-card-text">
                <span>{a.name}</span>
                <small class="soft">
                  {a.photoIds.length} of {ALBUM_LIMIT} photos{activeId === a.id ? ' · showing' : ''}
                </small>
              </span>
            </button>
          ))}
          {naming ? (
            <div class="panel new-album">
              <input
                class="album-name"
                placeholder="Album name"
                value={name}
                autoFocus
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => e.key === 'Enter' && create()}
              />
              <button class="primary-button" onClick={create}>
                Create album
              </button>
              <button class="text-button" onClick={() => setNaming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button class="add-photos" onClick={() => setNaming(true)}>
              New album
            </button>
          )}
        </>
      )}
    </main>
  )
}
