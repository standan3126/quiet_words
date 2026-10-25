// Photo albums: named sets of up to 20 photos. One album can be the daytime background,
// shown as a slow slideshow.
import { clearLegacyList, deletePhoto, legacyPhotoIds, newId, storePhoto } from './photos'
import { load, save } from './storage'

export const ALBUM_LIMIT = 20

export interface Album {
  id: string
  name: string
  photoIds: string[]
}

const KEY = 'albums'

export async function loadAlbums(): Promise<Album[]> {
  const albums = await load<Album[] | null>(KEY, null)
  if (albums) return albums
  // Photos added before albums existed move into albums of their own, 20 to an album.
  const ids = await legacyPhotoIds()
  const migrated: Album[] = []
  for (let i = 0; i < ids.length; i += ALBUM_LIMIT) {
    migrated.push({ id: newId(), name: i ? `My photos ${i / ALBUM_LIMIT + 1}` : 'My photos', photoIds: ids.slice(i, i + ALBUM_LIMIT) })
  }
  await save(KEY, migrated)
  await clearLegacyList()
  return migrated
}

async function update(change: (albums: Album[]) => Album[]): Promise<Album[]> {
  const next = change(await loadAlbums())
  await save(KEY, next)
  return next
}

export const createAlbum = (name: string) => update((albums) => [...albums, { id: newId(), name, photoIds: [] }])

export const renameAlbum = (id: string, name: string) => update((albums) => albums.map((a) => (a.id === id ? { ...a, name } : a)))

export async function deleteAlbum(id: string): Promise<Album[]> {
  const album = (await loadAlbums()).find((a) => a.id === id)
  await Promise.all((album?.photoIds ?? []).map(deletePhoto))
  return update((albums) => albums.filter((a) => a.id !== id))
}

export interface AddResult {
  albums: Album[]
  added: number
  failed: number // files that couldn't be opened as pictures
  overLimit: number // files left out because the album was full
}

export async function addToAlbum(albumId: string, files: File[]): Promise<AddResult> {
  // Ask the browser not to clear photos when space runs low; they can't be re-downloaded.
  navigator.storage?.persist?.().catch(() => {})
  const album = (await loadAlbums()).find((a) => a.id === albumId)
  if (!album) return { albums: await loadAlbums(), added: 0, failed: 0, overLimit: files.length }
  const room = ALBUM_LIMIT - album.photoIds.length
  const ids: string[] = []
  let failed = 0
  for (const file of files.slice(0, Math.max(0, room))) {
    try {
      ids.push(await storePhoto(file))
    } catch {
      failed++
    }
  }
  const albums = await update((all) => all.map((a) => (a.id === albumId ? { ...a, photoIds: [...a.photoIds, ...ids] } : a)))
  return { albums, added: ids.length, failed, overLimit: Math.max(0, files.length - Math.max(0, room)) }
}

export async function removeFromAlbum(albumId: string, photoId: string): Promise<Album[]> {
  await deletePhoto(photoId)
  return update((albums) => albums.map((a) => (a.id === albumId ? { ...a, photoIds: a.photoIds.filter((p) => p !== photoId) } : a)))
}

// Replaces every album at once (used when restoring a backup).
export async function replaceAlbums(albums: Album[]): Promise<void> {
  for (const album of await loadAlbums()) await Promise.all(album.photoIds.map(deletePhoto))
  await save(KEY, albums)
}
