import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { gear, homeButton, open, seed, settingsPanel } from './helpers'

// The family code lives only in the hub's private/ folder (gitignored), never in a public file.
const FAMILY_CODE = process.env.HUB_CODE ?? readFileSync('../hub/private/family-code.txt', 'utf8').trim()

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number) => ({ level, coins: 50, current: null, pendingBreak: null, breakNext: {}, revisit: null, stats })

test("GameHub's frame: Hub and the gear on the launch page, Home while playing, the gear never moves", async ({ page }) => {
  await seed(page, { progress: at(12) })
  await expect(page.getByRole('button', { name: 'Exit to GameHub' })).toBeVisible()
  await expect(page.getByText('Level 12')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Levels' })).toBeVisible()
  const spot = await gear(page).boundingBox()
  const play = await page.getByRole('button', { name: 'Play', exact: true }).boundingBox()
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByText('Level 12', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exit to GameHub' })).toBeHidden()
  expect(await gear(page).boundingBox()).toEqual(spot)
  // The level title and coins stay clear of Home and the gear.
  const home = (await homeButton(page).boundingBox())!
  const title = (await page.locator('.play-title').boundingBox())!
  const coins = (await page.locator('.coins').boundingBox())!
  expect(title.x).toBeGreaterThanOrEqual(home.x + home.width)
  expect(coins.x + coins.width).toBeLessThanOrEqual(spot!.x)
  await homeButton(page).click()
  expect(await page.getByRole('button', { name: 'Play', exact: true }).boundingBox()).toEqual(play)
})

test('the game no longer installs on its own; GameHub does', async ({ page, request }) => {
  await open(page)
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(0)
  const files: string[] = await (await request.get('/offline-files.json')).json()
  expect(files).toContain('/levels/pack-066.json')
  expect(files).toContain('/')
  expect(files).not.toContain('/sw.js')
  expect(files.some((f) => f.includes('scenery/') || f.includes('daily'))).toBe(false)
})

test("saves from before the move: progress moves to Quiet Words' own database, settings to the shared panel", async ({ page }) => {
  await seed(page, { progress: at(40), settings: { themeMode: 'night', volumeMusic: 0.1, sceneryMode: 'builtin', largeText: true } }, 'old')
  await expect(page.locator('.home-where')).toHaveText('Level 40')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  await expect(page.locator('html')).toHaveClass(/large-text/)
  const mine = await page.evaluate(() => JSON.parse(localStorage.getItem('quiet-words:my-settings')!))
  expect(mine).toEqual({ light: 'night', volumes: { music: 0.1 }, largeText: true })
  const oldLeft = await page.evaluate(
    () =>
      new Promise<number>((done) => {
        const req = indexedDB.open('keyval-store')
        req.onsuccess = () => {
          const count = req.result.transaction('keyval').objectStore('keyval').count()
          count.onsuccess = () => done(count.result)
        }
      }),
  )
  expect(oldLeft).toBe(0)
})

test('the shared Settings panel: Quiet Words sections, every music style, sleep timer, Reset', async ({ page }) => {
  await open(page)
  await gear(page).click()
  const panel = settingsPanel(page)
  await expect(panel.locator('h3:visible')).toHaveText(['Light', 'Daytime scenery', 'Sound', 'Play', 'Little games'])
  await expect(panel.locator('.hub-fold summary')).toHaveText(['Nature sounds', 'Move your progress', 'Credits'])
  await expect(panel.getByLabel('Music style')).toHaveValue('quiet-words')
  await panel.getByLabel('Music style').selectOption({ label: 'Celtic Harp' })
  await expect(panel.getByRole('radiogroup', { name: 'Sleep timer' })).toBeVisible()
  await panel.getByRole('radio', { name: 'Night' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night')
  await panel.getByRole('button', { name: 'Reset to GameHub settings' }).click()
  await panel.getByRole('button', { name: 'Tap again to reset' }).click()
  await expect(panel.getByLabel('Music style')).toHaveValue('quiet-words')
  expect(await page.evaluate(() => localStorage.getItem('quiet-words:my-settings'))).toBe('{}')
})

test('a transfer code carries progress to a fresh phone', async ({ page }) => {
  await seed(page, { progress: at(77) })
  await gear(page).click()
  const panel = settingsPanel(page)
  await panel.getByText('Move your progress').click()
  await panel.getByRole('button', { name: 'Get transfer code' }).click()
  const code = await panel.locator('.hub-code').inputValue()
  expect(code).toMatch(/^GH1\.quiet-words\./)

  await seed(page, {})
  await expect(page.locator('.home-where')).toHaveText('A journey through quiet places')
  await gear(page).click()
  await panel.getByText('Move your progress').click()
  await panel.getByRole('button', { name: 'Enter a code' }).click()
  await panel.locator('.hub-code').fill(code)
  await panel.getByRole('button', { name: 'Use this code' }).click()
  await expect(panel.locator('.hub-message')).toHaveText('Progress restored.')
  await panel.locator('.hub-settings-close').click()
  await expect(page.locator('.home-where')).toHaveText('Level 77')
  await open(page)
  await expect(page.locator('.home-where')).toHaveText('Level 77')
})

test('setting the level by hand is hidden behind taps and the family code', async ({ page }) => {
  await seed(page, { progress: at(23) })
  await gear(page).click()
  const panel = settingsPanel(page)
  const manual = panel.locator('section', { hasText: 'Set progress by hand' })
  await expect(manual).toBeHidden()
  for (let i = 0; i < 5; i++) await panel.locator('h2').click()
  await panel.locator('.hub-secret input').fill('0000')
  await panel.locator('.hub-secret button').click()
  await expect(panel.locator('.hub-secret input')).toHaveAttribute('placeholder', 'Not quite. Try again')
  await panel.locator('.hub-secret input').fill(FAMILY_CODE)
  await panel.locator('.hub-secret button').click()
  await expect(manual.getByLabel('Level', { exact: true })).toHaveValue('23')
  await manual.getByLabel('Level', { exact: true }).fill('105')
  await manual.getByLabel('Coins', { exact: true }).fill('300')
  await manual.getByRole('button', { name: 'Set', exact: true }).click()
  await expect(panel.locator('.hub-message')).toHaveText('Set: level 105, 300 coins.')
  await panel.locator('.hub-settings-close').click()
  await expect(page.locator('.home-where')).toHaveText('Level 105')
  await open(page)
  await expect(page.locator('.home-where')).toHaveText('Level 105')
})

// On an iPhone home-screen GameHub with a solid top bar, the page starts below the bar, so the
// puzzle must fit the height it's given: the tools at the bottom are on screen without scrolling.
test('fits the screen in an iPhone app with a solid top bar', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { get: () => true }))
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByText('Level 1', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.classList.contains('ios-solid-bar'))).toBe(true)
  const fits = await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)
  expect(fits).toBe(true)
  await expect(page.getByRole('button', { name: /^Reveal a letter/ })).toBeInViewport({ ratio: 1 })
})
