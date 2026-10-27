import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { seed } from './helpers'

// The family code lives only in the hub's private/ folder (gitignored), never in a public file.
const FAMILY_CODE = process.env.HUB_CODE ?? readFileSync('../hub/private/family-code.txt', 'utf8').trim()

const stats = { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 }
const at = (level: number) => ({ level, coins: 50, current: null, pendingBreak: null, breakNext: {}, daily: null, flowers: [], revisit: null, stats })

test('the home screen links back to GameHub', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Exit to GameHub' })).toHaveAttribute('href', 'https://standan3126.github.io/')
})

test('the game no longer installs on its own; GameHub does', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(0)
  const files: string[] = await (await request.get('/offline-files.json')).json()
  expect(files).toContain('/levels/pack-066.json')
  expect(files).toContain('/')
  expect(files).not.toContain('/sw.js')
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'GameHub' })).toBeVisible()
})

test('setting the level by hand is hidden behind taps and the family code', async ({ page }) => {
  await seed(page, { progress: at(23) })
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByLabel('Code')).toHaveCount(0)

  const heading = page.getByRole('heading', { name: 'Settings', exact: true })
  for (let i = 0; i < 5; i++) await heading.click()
  await page.getByLabel('Code').fill('0000')
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page.getByLabel('Code')).toHaveAttribute('placeholder', 'Not quite. Try again')
  await expect(page.getByLabel('Level', { exact: true })).toHaveCount(0)

  await page.getByLabel('Code').fill(FAMILY_CODE)
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page.getByLabel('Level', { exact: true })).toHaveValue('23')
  await page.getByLabel('Level', { exact: true }).fill('105')
  await page.getByLabel('Coins', { exact: true }).fill('300')
  await page.getByRole('button', { name: 'Set', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Set to level 105 with 300 coins.')

  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Continue · Level 105' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Continue · Level 105' })).toBeVisible()
})
