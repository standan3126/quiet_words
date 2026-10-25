import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { butterflyWord, dayNumber } from '../src/game/daily'
import type { Level } from '../src/game/level'
import { makeSearch } from '../src/modes/wordsearch-gen'
import { maxBlue, seed, swipe } from './helpers'

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number, extra: object = {}) => ({ level, coins: 50, current: null, pendingBreak: null, quizNext: 0, daily: null, flowers: [], stats, ...extra })

test('a quiz break follows level 8, untimed and kind', async ({ page }) => {
  await seed(page, { progress: at(8) })
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: 'More' }).click()
  await page.getByRole('button', { name: 'Skip this level' }).click()

  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`A little word break · ${i} of 3`)).toBeVisible()
    await page.locator('.quiz-choice').first().click()
    await expect(page.getByRole('status')).toContainText(/that's right|The answer is/)
    await expect(page.locator('.quiz-choice.right')).toHaveCount(1) // the right answer is always shown
    await page.getByRole('button', { name: i < 3 ? 'Next' : 'Finish' }).click()
  }
  await expect(page.getByText('All done.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Level 9', { exact: true })).toBeVisible()
  expect(Number(await page.locator('.coins span').textContent())).toBeGreaterThanOrEqual(53)
})

test('a word search break follows level 12, solved by swiping', async ({ page }) => {
  await seed(page, { progress: at(12) })
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: 'More' }).click()
  await page.getByRole('button', { name: 'Skip this level' }).click()

  const search = makeSearch(12, 1)
  await expect(page.getByText(`Word search · ${search.theme}`)).toBeVisible()
  for (const w of search.words) {
    const [first, last] = [w.cells[0], w.cells[w.cells.length - 1]]
    const a = (await page.locator(`[data-cell="${first[0]},${first[1]}"]`).boundingBox())!
    const b = (await page.locator(`[data-cell="${last[0]},${last[1]}"]`).boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
    await page.mouse.up()
    await expect(page.locator('.search-words li.found', { hasText: w.word })).toHaveCount(1)
  }
  await expect(page.getByText('All found.')).toBeVisible()
  await page.getByRole('dialog', { name: 'Word search complete' }).getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Level 13', { exact: true })).toBeVisible()
})

test('the daily puzzle: butterfly bonus, a pressed flower, and no streak to keep', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-24T10:00:00'))
  const daily: Level[] = JSON.parse(readFileSync('public/levels/daily.json', 'utf8'))
  const level = daily[dayNumber('2026-10-24') % daily.length]
  const marked = butterflyWord(level)

  await seed(page, { progress: at(3) })
  await page.getByRole('button', { name: "Today's puzzle" }).click()
  await expect(page.getByText('Daily puzzle', { exact: true })).toBeVisible()
  await expect(page.getByLabel('butterfly')).toBeVisible()

  await swipe(page, marked, level.letters)
  await expect(page.getByText('The butterfly flutters off · +10')).toBeVisible()
  await expect(page.getByLabel('butterfly')).toHaveCount(0)
  for (const p of level.words.filter((w) => w.word !== marked)) await swipe(page, p.word, level.letters)

  await expect(page.getByText('A pressed flower for your collection')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: "Today's puzzle · finished" })).toBeVisible()
  // The journey is exactly where it was.
  await expect(page.getByRole('button', { name: 'Continue · Level 3' })).toBeVisible()

  await page.getByRole('button', { name: 'Postcards' }).click()
  await expect(page.locator('.flower')).toHaveCount(1)
})

test('postcards fill in as places are finished, with no blue at night', async ({ page }) => {
  await seed(page, { progress: at(31), settings: { themeMode: 'night' } })
  await page.getByRole('button', { name: 'Postcards' }).click()
  await expect(page.getByText('2 of 66 places visited')).toBeVisible()
  await expect(page.locator('.postcard:not(.locked)')).toHaveCount(2)
  await expect(page.getByText('Clover Hill')).toBeVisible()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})

test('the breaks have no blue at night either', async ({ page }) => {
  await seed(page, { progress: at(12, { pendingBreak: { kind: 'wordsearch', after: 12 } }), settings: { themeMode: 'night' } })
  await page.getByRole('button', { name: /Continue/ }).click()
  await expect(page.locator('.search-grid')).toBeVisible()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await seed(page, { progress: at(8, { pendingBreak: { kind: 'quiz', after: 8 } }), settings: { themeMode: 'night' } })
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.locator('.quiz-choice').first().click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})
