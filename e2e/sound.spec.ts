import { expect, test } from '@playwright/test'

test('sleep timer fades, dims the screen, and a tap wakes it', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin your journey' }).click()
  await page.getByRole('button', { name: 'More' }).click()
  await page.getByRole('radio', { name: '15m' }).click()
  await page.getByRole('button', { name: 'Keep playing' }).click()

  await page.clock.fastForward('12:00')
  await expect(page.locator('.sleep-dim')).toHaveCount(0)
  await page.clock.fastForward('01:30') // the 2-minute fade starts at 13 minutes
  await expect(page.locator('.sleep-dim.fading')).toBeVisible()
  await page.clock.fastForward('02:00')
  await expect(page.getByText('Sleep well · tap to wake')).toBeVisible()

  await page.getByText('Sleep well · tap to wake').click()
  await expect(page.locator('.sleep-dim')).toHaveCount(0)
  await page.getByRole('button', { name: 'More' }).click()
  await expect(page.getByRole('radio', { name: 'Off' })).toHaveAttribute('aria-checked', 'true')
})

test('nature sounds can follow the scenery or a custom mix', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByText('Campfire')).toHaveCount(0)
  await page.getByText('Match the scenery').click()
  for (const layer of ['Rain', 'Creek', 'Waves', 'Wind', 'Crickets', 'Campfire', 'Birdsong']) await expect(page.getByText(layer, { exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByText('Campfire')).toBeVisible() // the choice is saved
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
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin your journey' }).click() // the tap unlocks audio
  expect(await loudest(page, 4000), 'nature sounds and music should be playing').toBeGreaterThan(0.001)

  await page.getByRole('button', { name: 'More' }).click()
  await page.getByLabel('Sound on').click({ force: true })
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
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin your journey' }).click()
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
