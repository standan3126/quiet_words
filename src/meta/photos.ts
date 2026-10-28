// Photo files, kept only on this device (IndexedDB), resized once when added.
// Which album a photo belongs to lives in albums.ts.
import { load, remove, save } from './storage'

const MAX_SIDE = 1600 // plenty for a phone screen, and keeps storage small
const key = (id: string) => `photo:${id}`

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const photoBlob = (id: string) => load<Blob | null>(key(id), null)

function drawScaled(image: ImageBitmap): HTMLCanvasElement {
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Resizes and stores a photo, returning its id. Throws if the file isn't a readable image.
export async function storePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file) // applies the camera's rotation
  const canvas = drawScaled(bitmap)
  bitmap.close()
  // JPEG rather than WebP: Safari can't encode WebP from a canvas.
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
  )
  const id = newId()
  await save(key(id), blob)
  return id
}

export async function deletePhoto(id: string): Promise<void> {
  try {
    await remove(key(id))
  } catch {
    // Already gone.
  }
}

// Before albums existed, photos were kept in one flat list under this key.
const LEGACY_LIST = 'photos'
export const legacyPhotoIds = async () => (await load<{ id: string }[]>(LEGACY_LIST, [])).map((p) => p.id)
export const clearLegacyList = () => remove(LEGACY_LIST)

// Stores an already-prepared photo (from a backup) without resizing it again.
export async function storePhotoBlob(blob: Blob): Promise<string> {
  const id = newId()
  await save(key(id), blob)
  return id
}
