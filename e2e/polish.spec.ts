import { readFileSync } from 'node:fs'
import { devices, expect, test } from '@playwright/test'
import type { Pack } from '../src/game/level'
import { gear, open, seed, settingsPanel, swipe } from './helpers'

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number) => ({ level, coins: 50, current: null, pendingBreak: null, quizNext: 0, stats })

test('words can be typed on a keyboard', async ({ page }) => {
  const level = (JSON.parse(readFileSync('public/levels/pack-001.json', 'utf8')) as Pack).levels[0]
  const [first] = level.words
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.locator('.wheel-letter').first()).toBeVisible() // the puzzle has loaded
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
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.locator('.cell.challenge')).toHaveCount(challenge.word.length)
  await swipe(page, challenge.word, level.letters)
  await expect(page.getByText(`Challenge word · +${challenge.word.length}`)).toBeVisible()
  await expect(page.locator('.coins span')).toHaveText(String(50 + challenge.word.length))
})

test('a backup file carries progress to a fresh device; photos stay on the phone', async ({ page, browser }) => {
  await seed(page, { progress: at(23) })
  await gear(page).click()
  const panel = settingsPanel(page)
  await panel.getByText('Move your progress').click()
  const download = page.waitForEvent('download')
  await panel.getByRole('button', { name: 'Save backup file' }).click()
  const file = await (await download).path()

  // A brand-new browser profile stands in for the new phone.
  const fresh = await browser.newContext({ ...devices['Pixel 7'] })
  const other = await fresh.newPage()
  await open(other)
  await expect(other.locator('.home-where')).toHaveText('A journey through quiet places')
  await gear(other).click()
  const otherPanel = settingsPanel(other)
  await otherPanel.getByText('Move your progress').click()
  const chooser = other.waitForEvent('filechooser')
  await otherPanel.getByRole('button', { name: 'Load backup file' }).click()
  await (await chooser).setFiles(file)
  await expect(otherPanel.locator('.hub-message')).toHaveText('Progress restored.')
  await otherPanel.locator('.hub-settings-close').click()
  await expect(other.locator('.home-where')).toHaveText('Level 23')
  await fresh.close()
})
