import type { Page } from '@playwright/test'

// Opens the game and taps GameHub's "Tap to Start" (it lets sound play on iPhone).
export async function open(page: Page, path = '/') {
  await page.goto(path)
  await page.locator('.hub-start').click()
  await page.locator('.hub-start').waitFor({ state: 'detached' })
}

// GameHub's frame and shared Settings panel.
export const gear = (page: Page) => page.locator('.hub-gear')
export const homeButton = (page: Page) => page.locator('.hub-corner', { hasText: 'Home' })
export const settingsPanel = (page: Page) => page.locator('dialog.hub-settings')

// Drags the pointer through the wheel letters that spell `word`.
export async function swipe(page: Page, word: string, letters: string) {
  const used = new Set<number>()
  const indices = [...word].map((ch) => {
    const i = [...letters].findIndex((l, j) => l === ch && !used.has(j))
    used.add(i)
    return i
  })
  const centers = []
  for (const i of indices) {
    const box = (await page.locator(`.wheel-letter[data-index="${i}"] circle`).boundingBox())!
    centers.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
  }
  await page.mouse.move(centers[0].x, centers[0].y)
  await page.mouse.down()
  for (const c of centers.slice(1)) await page.mouse.move(c.x, c.y, { steps: 6 })
  await page.mouse.up()
}

// The highest blue value of any pixel on screen, with animations settled.
export async function maxBlue(page: Page): Promise<number> {
  const png = (await page.screenshot({ fullPage: true, animations: 'disabled' })).toString('base64')
  return page.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, c.width, c.height).data
    let max = 0
    for (let i = 2; i < px.length; i += 4) max = Math.max(max, px[i])
    return max
  }, png)
}

// Writes saved progress/settings straight into storage, then opens the game, to start mid-game.
// The writing happens on a plain data file from the same site, so the game isn't running and
// can't save over it while starting up. Settings are written the old way (Quiet Words' own,
// before the shared panel), which the game carries over to the panel when it starts.
// db: 'own' is Quiet Words' database; 'old' the shared default one it used before 2026-10-28.
export async function seed(page: Page, values: { progress?: object; settings?: object }, db: 'own' | 'old' = 'own') {
  await page.goto('/levels/index.json')
  await page.evaluate(
    ({ values, db }) =>
      new Promise<void>((done) => {
        localStorage.clear()
        const [name, store] = db === 'own' ? ['quiet-words', 'saves'] : ['keyval-store', 'keyval']
        const req = indexedDB.open(name)
        req.onupgradeneeded = () => req.result.createObjectStore(store)
        req.onsuccess = () => {
          const tx = req.result.transaction(store, 'readwrite')
          tx.objectStore(store).clear() // a fresh phone, apart from what's given
          if (values.progress) tx.objectStore(store).put(values.progress, 'progress')
          if (values.settings) tx.objectStore(store).put(values.settings, 'settings')
          tx.oncomplete = () => done()
        }
      }),
    { values, db },
  )
  await open(page)
}

// Runs `write` against the game's storage from a page where the game isn't running.
export async function withStorage(page: Page, write: () => Promise<void>) {
  await page.goto('/levels/index.json')
  await page.evaluate(write)
  await open(page)
}
