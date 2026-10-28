import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import type { Pack } from '../src/game/level'
import { open, swipe } from './helpers'

const pack: Pack = JSON.parse(readFileSync('public/levels/pack-001.json', 'utf8'))
const [level1] = pack.levels

const cellText = (page: Page, x: number, y: number) => page.locator(`[data-cell="${x},${y}"]`)

test('swiping fills the grid, survives a reload, and finishes the level', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.getByText(`Level 1`, { exact: true })).toBeVisible()

  const [first, ...rest] = level1.words
  await swipe(page, first.word, level1.letters)
  for (let i = 0; i < first.word.length; i++) {
    const x = first.dir === 'h' ? first.x + i : first.x
    const y = first.dir === 'v' ? first.y + i : first.y
    await expect(cellText(page, x, y)).toHaveText(first.word[i].toUpperCase())
  }

  // Progress is saved after every word.
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(cellText(page, first.x, first.y)).toHaveText(first.word[0].toUpperCase())

  // A too-short swipe changes nothing and costs nothing.
  const coins = await page.locator('.coins span').textContent()
  await swipe(page, level1.letters.slice(0, 2), level1.letters)
  await expect(page.locator('.cell.found')).toHaveCount(first.word.length)
  await expect(page.locator('.coins span')).toHaveText(coins!)

  for (const p of rest) await swipe(page, p.word, level1.letters)
  await expect(page.getByRole('dialog', { name: 'Level complete' })).toBeVisible()
  await expect(page.locator('.coins span')).toHaveText(String(Number(coins) + 5))
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Level 2', { exact: true })).toBeVisible()
})

test('hints reveal letters and cost coins', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.locator('.coins span')).toHaveText('50')
  await page.getByRole('button', { name: /^Reveal a letter/ }).click()
  await expect(page.locator('.cell.revealed')).toHaveCount(1)
  await expect(page.locator('.coins span')).toHaveText('40')

  await page.getByRole('button', { name: /^Reveal the square you tap/ }).click()
  await page.locator('.cell.hidden').first().click()
  await expect(page.locator('.coins span')).toHaveText('20')
})

test('skip moves on with no penalty', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await page.getByRole('button', { name: 'Skip this level' }).click()
  await page.getByRole('dialog', { name: 'Skip this level' }).getByRole('button', { name: 'Skip this level' }).click()
  await expect(page.getByText('Level 2', { exact: true })).toBeVisible()
  await expect(page.locator('.coins span')).toHaveText('50')
})

test('tapping a solved word shows its meaning', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const [first] = level1.words
  await swipe(page, first.word, level1.letters)
  await page.locator(`[data-cell="${first.x},${first.y}"]`).click()
  const sheet = page.getByRole('dialog', { name: 'Word meanings' })
  await expect(sheet).toContainText(first.word)
  await expect(sheet.locator('p')).not.toBeEmpty()
})
