import { expect, test } from '@playwright/test'
import { gear, open, settingsPanel } from './helpers'

test('sleep timer (in the shared Settings) fades, dims the screen, and a tap wakes it', async ({ page }) => {
  await page.clock.install()
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await gear(page).click()
  await settingsPanel(page).getByRole('radio', { name: '15m' }).click()
  await settingsPanel(page).locator('.hub-settings-close').click()

  await page.clock.fastForward('12:00')
  await expect(page.locator('.hub-sleep')).toHaveCount(0)
  await page.clock.fastForward('01:30') // the 2-minute fade starts at 13 minutes
  await expect(page.locator('.hub-sleep.fading')).toBeVisible()
  await page.clock.fastForward('02:00')
  await expect(page.getByText('Sleep well · tap to wake')).toBeVisible()

  await page.getByText('Sleep well · tap to wake').click()
  await expect(page.locator('.hub-sleep')).toHaveCount(0)
  await gear(page).click()
  await expect(settingsPanel(page).getByRole('radio', { name: 'Off' })).toHaveAttribute('aria-checked', 'true')
})

test('nature sounds follow each place until the player makes their own mix', async ({ page }) => {
  await open(page)
  await gear(page).click()
  const panel = settingsPanel(page)
  await panel.getByText('Nature sounds', { exact: true }).last().click()
  await expect(panel.getByText('These follow each place.', { exact: false })).toBeVisible()
  for (const layer of ['Rain', 'Creek', 'Waves', 'Wind', 'Crickets', 'Campfire', 'Birdsong']) await expect(panel.getByRole('slider', { name: layer })).toBeVisible()
  await expect(panel.getByRole('slider', { name: 'Birdsong' })).toHaveValue('0.55') // Meadow by day
  await panel.getByRole('slider', { name: 'Rain' }).fill('0.4')
  await open(page)
  await gear(page).click()
  await panel.getByText('Nature sounds', { exact: true }).last().click()
  await expect(panel.getByRole('slider', { name: 'Rain' })).toHaveValue('0.4') // the mix is saved
  await panel.getByRole('button', { name: 'Follow each place again' }).click()
  await expect(panel.getByText('These follow each place.', { exact: false })).toBeVisible()
})

// Taps the app's final audio output so the test can measure what would reach the speakers.
async function listen(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const connect = AudioNode.prototype.connect as (...args: unknown[]) => unknown
    AudioNode.prototype.connect = function (this: AudioNode, ...args: unknown[]) {
      const dest = args[0]
      if (dest instanceof AudioDestinationNode) {
        const analyser = this.context.createAnalyser()
        analyser.fftSize = 2048
        connect.call(this, analyser)
        ;(window as unknown as { __level: () => number }).__level = () => {
          const data = new Float32Array(analyser.fftSize)
          analyser.getFloatTimeDomainData(data)
          return Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length)
        }
      }
      return connect.apply(this, args)
    } as typeof AudioNode.prototype.connect
  })
}

const level = (page: import('@playwright/test').Page) => page.evaluate(() => (window as unknown as { __level?: () => number }).__level?.() ?? 0)

async function loudest(page: import('@playwright/test').Page, ms: number) {
  let max = 0
  for (let t = 0; t < ms; t += 250) {
    max = Math.max(max, await level(page))
    await page.waitForTimeout(250)
  }
  return max
}

test('the live engine plays after a tap, and mute silences it', async ({ page }) => {
  await listen(page)
  await open(page) // Tap to Start unlocks audio
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  expect(await loudest(page, 4000), 'nature sounds and music should be playing').toBeGreaterThan(0.001)

  await gear(page).click()
  await settingsPanel(page).getByText('Mute everything').click()
  await page.waitForTimeout(2500)
  expect(await loudest(page, 1000), 'mute should silence everything').toBeLessThan(0.0005)
})

test('sound pauses while the app is out of sight and comes back with it', async ({ page }) => {
  await page.addInitScript(() => {
    const Real = window.AudioContext
    window.AudioContext = class extends Real {
      constructor(...args: ConstructorParameters<typeof AudioContext>) {
        super(...args)
        ;(window as unknown as { __ctx: AudioContext }).__ctx = this
      }
    }
  })
  await open(page)
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const state = () => page.evaluate(() => (window as unknown as { __ctx: AudioContext }).__ctx.state)
  await expect.poll(state).toBe('running')

  const setVisibility = (v: 'hidden' | 'visible') =>
    page.evaluate((v) => {
      Object.defineProperty(document, 'visibilityState', { value: v, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }, v)
  await setVisibility('hidden')
  await expect.poll(state).toBe('suspended')
  await setVisibility('visible')
  await expect.poll(state).toBe('running')
})
