// Backup and restore: one file holding progress, settings and photo albums, for moving to a
// new phone or a new web address (each address keeps its own saved data).
import { loadAlbums, replaceAlbums, type Album } from './albums'
import { newId, photoBlob, storePhotoBlob } from './photos'
import { loadProgress, saveProgress, type Progress } from './progress'
import { loadSettings, saveSettings, type Settings } from './settings'

export interface Backup {
  app: 'quiet-words'
  version: 1
  created: string
  progress: Progress
  settings: Settings
  albums: { name: string; photos: string[] }[] // photos as data: URLs
  activeAlbum: number | null // index into albums
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

export async function makeBackup(): Promise<Blob> {
  const [progress, settings, albums] = await Promise.all([loadProgress(), loadSettings(), loadAlbums()])
  const backup: Backup = {
    app: 'quiet-words',
    version: 1,
    created: new Date().toISOString(),
    progress,
    settings,
    albums: await Promise.all(
      albums.map(async (a) => ({
        name: a.name,
        photos: (
          await Promise.all(
            a.photoIds.map(async (id) => {
              const blob = await photoBlob(id)
              return blob ? blobToDataUrl(blob) : null
            }),
          )
        ).filter((p): p is string => p !== null),
      })),
    ),
    activeAlbum: albums.findIndex((a) => a.id === settings.activeAlbum),
  }
  return new Blob([JSON.stringify(backup)], { type: 'application/json' })
}

export const backupFileName = (date = new Date()) => `quiet-words-backup-${date.toISOString().slice(0, 10)}.json`

export async function readBackup(file: File): Promise<Backup> {
  let data: Backup
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error("That file isn't a Quiet Words backup.")
  }
  if (data?.app !== 'quiet-words' || data.version !== 1 || !data.progress || !data.settings) {
    throw new Error("That file isn't a Quiet Words backup.")
  }
  return data
}

// Replaces everything saved on this device with the backup.
export async function restoreBackup(backup: Backup): Promise<void> {
  const albums: Album[] = []
  for (const a of backup.albums ?? []) {
    const photoIds: string[] = []
    for (const url of a.photos) photoIds.push(await storePhotoBlob(await (await fetch(url)).blob()))
    albums.push({ id: newId(), name: a.name, photoIds })
  }
  await replaceAlbums(albums)
  const active = backup.activeAlbum !== null && backup.activeAlbum >= 0 ? albums[backup.activeAlbum] : undefined
  await saveSettings({ ...backup.settings, activeAlbum: active?.id ?? null })
  await saveProgress(backup.progress)
}
