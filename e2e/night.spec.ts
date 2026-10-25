import { expect, test, type Page } from '@playwright/test'

// Animations are finished first so a day->night fade in progress isn't counted.
// Decode a screenshot in the page and return the highest blue value of any pixel.
async function maxBlue(page: Page): Promise<number> {
  const png = (await page.screenshot({ fullPage: true, animations: 'disabled' })).toString('base64')
  return page.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, img.width, img.height).data
    let max = 0
    for (let i = 2; i < px.length; i += 4) max = Math.max(max, px[i])
    return max
  }, png)
}

async function chooseTheme(page: Page, label: 'Day' | 'Night') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('radio', { name: label }).click()
}

test('night mode emits no blue light', async ({ page }) => {
  await chooseTheme(page, 'Night')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Begin your journey' }).click()
  await page.getByRole('button', { name: /^Reveal a letter/ }).click()
  await page.getByRole('button', { name: 'More' }).click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Keep playing' }).click()

  // Text boxes: the album name field, focused, with its cursor showing.
  await page.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Photo albums ›' }).click()
  await page.getByRole('button', { name: 'New album' }).click()
  await page.getByPlaceholder('Album name').fill('Night test')
  await page.getByPlaceholder('Album name').selectText()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await page.screenshot({ path: 'test-results/home-night.png' })
})

test('theme choice survives a reload', async ({ page }) => {
  // At noon "auto" means day, so only a saved choice can bring night mode back after reload.
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00'))
  await chooseTheme(page, 'Night')
  const stored = () =>
    page.evaluate(
      () =>
        new Promise((done) => {
          const req = indexedDB.open('keyval-store')
          req.onsuccess = () => {
            const get = req.result.transaction('keyval').objectStore('keyval').get('settings')
            get.onsuccess = () => done(get.result?.themeMode)
          }
        }),
    )
  await expect.poll(stored).toBe('night')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
})
