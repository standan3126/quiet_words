import { expect, test, type Page } from '@playwright/test'
import { gear, open, settingsPanel } from './helpers'

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
  await open(page)
  await gear(page).click()
  await settingsPanel(page).getByRole('radio', { name: label }).click()
}

test('night mode emits no blue light', async ({ page }) => {
  await chooseTheme(page, 'Night')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  expect(await maxBlue(page)).toBeLessThanOrEqual(8) // the shared Settings panel
  await settingsPanel(page).locator('.hub-settings-close').click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8) // the launch page and GameHub's frame
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await page.getByRole('button', { name: /^Reveal a letter/ }).click()
  await page.getByRole('button', { name: 'Skip this level' }).click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Keep playing' }).click()

  // Text boxes: the album name field, focused, with its cursor showing.
  await gear(page).click()
  await settingsPanel(page).getByRole('button', { name: 'Photo albums ›' }).click()
  await page.getByRole('button', { name: 'New album' }).click()
  await page.getByPlaceholder('Album name').fill('Night test')
  await page.getByPlaceholder('Album name').selectText()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})

test('theme choice survives a reload', async ({ page }) => {
  // At noon "auto" means day, so only a saved choice can bring night mode back after reload.
  await page.clock.setFixedTime(new Date('2026-10-24T12:00:00'))
  await chooseTheme(page, 'Night')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('quiet-words:my-settings')!).light)).toBe('night')
  await open(page)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
})
