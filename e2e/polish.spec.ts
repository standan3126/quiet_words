import { readFileSync } from 'node:fs'
import { devices, expect, test } from '@playwright/test'
import type { Pack } from '../src/game/level'
import { seed, swipe } from './helpers'

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number) => ({ level, coins: 50, current: null, pendingBreak: null, quizNext: 0, daily: null, flowers: [], stats })

test('words can be typed on a keyboard', async ({ page }) => {
  const level = (JSON.parse(readFileSync('public/levels/pack-001.json', 'utf8')) as Pack).levels[0]
  const [first] = level.words
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin your journey' }).click()
  await page.keyboard.type(first.word + 'q') // q isn't on the wheel, so it's ignored
  await expect(page.locator('.preview span')).toHaveCount(first.word.length)
  await page.keyboard.press('Enter')
  await expect(page.locator('.cell.found')).toHaveCount(first.word.length)
})

test('a challenge word pays a coin per letter', async ({ page }) => {
  const packs: Pack[] = [7, 8, 9, 10, 11].map((n) => JSON.parse(readFileSync(`public/levels/pack-${String(n).padStart(3, '0')}.json`, 'utf8')))
  const level = packs.flatMap((p) => p.levels).find((l) => l.words.some((w) => w.challenge))!
  const challenge = level.words.find((w) => w.challenge)!
  await seed(page, { progress: at(level.id) })
  await page.getByRole('button', { name: /Continue/ }).click()
  await expect(page.locator('.cell.challenge')).toHaveCount(challenge.word.length)
  await swipe(page, challenge.word, level.letters)
  await expect(page.getByText(`Challenge word · +${challenge.word.length}`)).toBeVisible()
  await expect(page.locator('.coins span')).toHaveText(String(50 + challenge.word.length))
})

test('a backup carries progress and albums to a fresh device', async ({ page, browser }) => {
  await seed(page, { progress: at(23) })
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Photo albums ›' }).click()
  await page.getByRole('button', { name: 'New album' }).click()
  await page.getByPlaceholder('Album name').fill('Lake house')
  await page.getByRole('button', { name: 'Create album' }).click()
  const photo = await page.evaluate(() => {
    const c = document.createElement('canvas')
    c.width = 60
    c.height = 100
    c.getContext('2d')!.fillRect(0, 0, 60, 100)
    return c.toDataURL('image/png').split(',')[1]
  })
  await page.locator('input[type=file]').setInputFiles({ name: 'lake.png', mimeType: 'image/png', buffer: Buffer.from(photo, 'base64') })
  await page.getByRole('button', { name: 'Use as background' }).click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Save a backup' }).click()
  const file = await (await download).path()

  // A brand-new browser profile stands in for the new phone or new web address.
  const fresh = await browser.newContext({ ...devices['Pixel 7'] })
  const other = await fresh.newPage()
  await other.goto('/')
  await expect(other.getByRole('button', { name: 'Begin your journey' })).toBeVisible()
  await other.getByRole('button', { name: 'Settings' }).click()
  await other.locator('input[type=file][accept^="application/json"]').setInputFiles(file)
  await expect(other.getByRole('dialog', { name: 'Restore backup' })).toContainText('level 23, with 1 album (1 photo)')
  await other.getByRole('button', { name: 'Restore', exact: true }).click()
  await expect(other.getByRole('button', { name: 'Continue · Level 23' })).toBeVisible()
  await other.getByRole('button', { name: 'Settings' }).click()
  await other.getByRole('button', { name: 'Photo albums ›' }).click()
  await expect(other.getByText('1 of 20 photos · showing')).toBeVisible()
  await fresh.close()
})
