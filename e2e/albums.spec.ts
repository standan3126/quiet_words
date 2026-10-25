import { expect, test, type Page } from '@playwright/test'
import { withStorage } from './helpers'

// Small test photos, each a different colour so slides can be told apart.
async function makePhotos(page: Page, count: number) {
  const data: string[] = await page.evaluate((count) => {
    return Array.from({ length: count }, (_, i) => {
      const c = document.createElement('canvas')
      c.width = 90
      c.height = 160
      const g = c.getContext('2d')!
      g.fillStyle = `hsl(${(i * 47) % 360}, 70%, 55%)`
      g.fillRect(0, 0, 90, 160)
      return c.toDataURL('image/png').split(',')[1]
    })
  }, count)
  return data.map((d, i) => ({ name: `photo-${i}.png`, mimeType: 'image/png', buffer: Buffer.from(d, 'base64') }))
}

async function maxBlue(page: Page): Promise<number> {
  const png = (await page.screenshot({ animations: 'disabled' })).toString('base64')
  return page.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, c.width, c.height).data
    let max = 0
    for (let i = 2; i < px.length; i += 4) max = Math.max(max, px[i])
    return max
  }, png)
}

async function openAlbums(page: Page) {
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Photo albums ›' }).click()
}

async function newAlbum(page: Page, name: string) {
  await page.getByRole('button', { name: 'New album' }).click()
  await page.getByPlaceholder('Album name').fill(name)
  await page.getByRole('button', { name: 'Create album' }).click()
}

test('an album plays as a slow slideshow by day, never at night', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('radio', { name: 'Day' }).click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()

  await openAlbums(page)
  await newAlbum(page, 'Beach trip')
  await page.locator('input[type=file]').setInputFiles(await makePhotos(page, 2))
  await expect(page.getByRole('status')).toContainText('Added 2 photos.')
  await expect(page.getByText('2 of 20 photos')).toBeVisible()
  await page.getByRole('button', { name: 'Use as background' }).click()
  await expect(page.getByRole('button', { name: 'Showing as your background' })).toBeDisabled()

  await page.getByRole('button', { name: 'Back', exact: true }).click() // album list
  await page.getByRole('button', { name: 'Back', exact: true }).click() // settings
  await page.getByRole('button', { name: 'Back', exact: true }).click() // home
  await expect(page.locator('.scene img.slide')).toHaveCount(1)
  const first = await page.locator('.scene img.slide').getAttribute('src')

  // 45 seconds later the next photo fades in over the first.
  await page.clock.fastForward('00:44')
  await expect(page.locator('.scene img.slide')).toHaveCount(1)
  await page.clock.fastForward('00:02')
  await expect(page.locator('.scene img.slide')).toHaveCount(2)
  expect(await page.locator('.scene img.slide').last().getAttribute('src')).not.toBe(first)

  // Night: no photos at all, just the painted scene and its fireflies, with no blue light.
  await page.getByRole('button', { name: 'Switch to night mode' }).click()
  await expect(page.locator('.scene.painted')).toBeVisible()
  await expect(page.locator('.scene img')).toHaveCount(0)
  await expect(page.locator('.firefly')).toHaveCount(14)
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})

test('albums hold at most 20 photos', async ({ page }) => {
  await page.goto('/')
  await openAlbums(page)
  await newAlbum(page, 'Garden')
  await page.locator('input[type=file]').setInputFiles(await makePhotos(page, 21))
  await expect(page.getByRole('status')).toContainText('Added 20 photos.')
  await expect(page.getByRole('status')).toContainText("so 1 wasn't added")
  await expect(page.getByRole('button', { name: 'This album is full' })).toBeDisabled()

  await page.getByRole('button', { name: 'Remove photo' }).first().click()
  await expect(page.getByText('19 of 20 photos')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add photos (1 more fit)' })).toBeEnabled()

  // Albums and their photos survive a reload.
  await page.reload()
  await openAlbums(page)
  await expect(page.getByText('19 of 20 photos')).toBeVisible()
})

test('moving scenery: bees, birds and fluff by day, and it can be turned off', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('radio', { name: 'Day' }).click()
  await page.getByRole('radio', { name: 'Painted' }).click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.locator('.bee')).toHaveCount(3)
  await expect(page.locator('.bird')).toHaveCount(3)
  await expect(page.locator('.fluff')).toHaveCount(7)

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByText('Moving scenery').click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.locator('.scene-motion')).toHaveCount(0)
})

test('photos added before albums existed move into "My photos"', async ({ page }) => {
  // Recreate the old storage layout: a flat photo list plus the photo itself.
  await withStorage(page, async () => {
    const c = document.createElement('canvas')
    c.width = c.height = 10
    const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/jpeg'))
    await new Promise<void>((done) => {
      const req = indexedDB.open('keyval-store')
      req.onupgradeneeded = () => req.result.createObjectStore('keyval')
      req.onsuccess = () => {
        const tx = req.result.transaction('keyval', 'readwrite')
        tx.objectStore('keyval').put([{ id: 'old1', added: 1 }], 'photos')
        tx.objectStore('keyval').put(blob, 'photo:old1')
        tx.objectStore('keyval').delete('albums')
        tx.oncomplete = () => done()
      }
    })
  })
  await openAlbums(page)
  await expect(page.getByText('My photos')).toBeVisible()
  await expect(page.getByText('1 of 20 photos')).toBeVisible()
})
