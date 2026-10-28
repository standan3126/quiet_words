import { expect, test, type Page } from '@playwright/test'
import { bankIndex, SENTENCES } from '../src/modes/word-games-bank'
import { makeSearch } from '../src/modes/wordsearch-gen'
import { gear, homeButton, maxBlue, seed, settingsPanel } from './helpers'

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number, extra: object = {}) => ({ level, coins: 50, current: null, pendingBreak: null, breakNext: {}, stats, ...extra })
// Only the one little game, after every `every` levels.
const only = (kind: string, every = 4) => ({ breakEvery: every, breakKinds: [kind] })
const skipLevel = async (page: Page) => {
  await page.getByRole('button', { name: 'Skip this level' }).click()
  await page.getByRole('dialog', { name: 'Skip this level' }).getByRole('button', { name: 'Skip this level' }).click()
}
const play = (page: Page) => page.getByRole('button', { name: 'Play', exact: true }).click()

test('a fill-the-blank break follows its level, untimed and kind', async ({ page }) => {
  await seed(page, { progress: at(8), settings: only('grammar', 8) })
  await play(page)
  await skipLevel(page)

  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`Fill the blank · ${i} of 3`)).toBeVisible()
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

test('a word search break follows its level, solved by swiping', async ({ page }) => {
  await seed(page, { progress: at(12, { breakNext: { wordsearch: 1 } }), settings: only('wordsearch', 12) })
  await play(page)
  await skipLevel(page)

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
    await expect(page.locator('.search-marks line:not(.mark-live)')).toHaveCount(search.words.indexOf(w) + 1)
  }
  await expect(page.getByText('All found.')).toBeVisible()
  await page.getByRole('dialog', { name: 'Word search complete' }).getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Level 13', { exact: true })).toBeVisible()
})

test('a swipe that is not a word leaves no highlight behind', async ({ page }) => {
  await seed(page, { progress: at(12, { pendingBreak: { kind: 'wordsearch', after: 12 } }) })
  await play(page)
  const a = (await page.locator('[data-cell="0,0"]').boundingBox())!
  const b = (await page.locator('[data-cell="1,0"]').boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 })
  await expect(page.locator('.search-marks .mark-live')).toHaveCount(1)
  await page.mouse.up()
  await expect(page.locator('.search-marks line')).toHaveCount(0)
})

test('spot the mistake and the sentence builder', async ({ page }) => {
  await seed(page, { progress: at(4, { pendingBreak: { kind: 'mistake', after: 4 } }) })
  await play(page)
  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`Spot the mistake · ${i} of 3`)).toBeVisible()
    await page.locator('.tap-word').first().click()
    await expect(page.locator('.tap-word.right')).toHaveCount(1)
    await page.getByRole('button', { name: i < 3 ? 'Next' : 'Finish' }).click()
  }
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Level 4', { exact: true })).toBeVisible()

  await seed(page, { progress: at(4, { pendingBreak: { kind: 'unscramble', after: 4 } }) })
  await play(page)
  const sentence = SENTENCES[bankIndex('unscramble', 0)]
  // Tap the words in order; the pool shrinks as each one moves up.
  for (const word of sentence.split(' ')) await page.locator('.build-pool .tap-word', { hasText: new RegExp(`^${word.replace(/[.?!]/g, '\\$&')}$`) }).first().click()
  await expect(page.getByRole('status')).toContainText("that's right")
})

test('little games can be turned off, or chosen one by one', async ({ page }) => {
  await seed(page, { progress: at(2) })
  await gear(page).click()
  const panel = settingsPanel(page)
  const slider = panel.getByRole('slider', { name: /How often/ })
  await slider.fill('0')
  await expect(panel.getByText('Never')).toBeVisible()
  await slider.fill('7')
  await expect(panel.getByText('After every level')).toBeVisible()
  for (const name of ['Word search', 'Fill the blank', 'Spelling', 'Spot the mistake', 'Parts of speech', 'Punctuation']) await panel.getByRole('checkbox', { name }).uncheck()
  await panel.locator('.hub-settings-close').click()
  await play(page)
  await skipLevel(page)
  await expect(page.getByText('Sentence builder · 1 of 3')).toBeVisible()
})

test('Levels: postcards fill in as places are finished, with no blue at night', async ({ page }) => {
  await seed(page, { progress: at(31), settings: { themeMode: 'night' } })
  await page.getByRole('button', { name: 'Levels' }).click()
  await expect(page.getByText('2 of 66 places visited')).toBeVisible()
  await expect(page.locator('.postcard:not(.locked)')).toHaveCount(2)
  await expect(page.getByText('Clover Hill')).toBeVisible()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})

test('a postcard plays its place again without moving the journey along', async ({ page }) => {
  await seed(page, { progress: at(31) })
  await page.getByRole('button', { name: 'Levels' }).click()
  await page.getByRole('button', { name: 'Visit Clover Hill again' }).click()
  await expect(page.getByText('Level 1 of 15 · visiting again')).toBeVisible()
  await homeButton(page).click()
  await expect(page.locator('.home-where')).toHaveText('Visiting Clover Hill again')
  // Levels has the way back to the journey, where it was.
  await page.getByRole('button', { name: 'Levels' }).click()
  await page.getByRole('button', { name: 'Back to your journey · Level 31' }).click()
  await expect(page.getByText('Level 31', { exact: true })).toBeVisible()

  // The last level of the place leads back to Levels, with the journey where it was.
  await seed(page, { progress: at(31, { revisit: { packId: 1, level: 15, current: null } }) })
  await play(page)
  await expect(page.getByText('Level 15 of 15 · visiting again')).toBeVisible()
  await skipLevel(page)
  await expect(page.getByRole('heading', { name: 'Levels' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Back to your journey/ })).toHaveCount(0)
  await homeButton(page).click()
  await expect(page.locator('.home-where')).toHaveText('Level 31')
  await play(page)
  await expect(page.getByText('Level 31', { exact: true })).toBeVisible()
})

test('the breaks have no blue at night either', async ({ page }) => {
  await seed(page, { progress: at(12, { pendingBreak: { kind: 'wordsearch', after: 12 } }), settings: { themeMode: 'night' } })
  await play(page)
  await expect(page.locator('.search-grid')).toBeVisible()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await seed(page, { progress: at(8, { pendingBreak: { kind: 'grammar', after: 8 } }), settings: { themeMode: 'night' } })
  await play(page)
  await page.locator('.quiz-choice').first().click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await seed(page, { progress: at(8, { pendingBreak: { kind: 'speech', after: 8 } }), settings: { themeMode: 'night' } })
  await play(page)
  await page.locator('.tap-word').first().click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  // Night highlighter strokes over a found word.
  const search = makeSearch(12, 0)
  await seed(page, { progress: at(12, { pendingBreak: { kind: 'wordsearch', after: 12 } }), settings: { themeMode: 'night' } })
  await play(page)
  for (const w of search.words.slice(0, 4)) {
    const [first, last] = [w.cells[0], w.cells[w.cells.length - 1]]
    const a = (await page.locator(`[data-cell="${first[0]},${first[1]}"]`).boundingBox())!
    const b = (await page.locator(`[data-cell="${last[0]},${last[1]}"]`).boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 })
    await page.mouse.up()
  }
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
  await seed(page, { progress: at(8, { pendingBreak: { kind: 'punctuation', after: 8 } }), settings: { themeMode: 'night' } })
  await play(page)
  await page.locator('.quiz-choice').first().click()
  expect(await maxBlue(page)).toBeLessThanOrEqual(8)
})
