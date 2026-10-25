import type { Page } from '@playwright/test'

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
// can't save over it while starting up.
export async function seed(page: Page, values: { progress?: object; settings?: object }) {
  await page.goto('/levels/index.json')
  await page.evaluate(
    (values) =>
      new Promise<void>((done) => {
        const req = indexedDB.open('keyval-store')
        req.onupgradeneeded = () => req.result.createObjectStore('keyval')
        req.onsuccess = () => {
          const tx = req.result.transaction('keyval', 'readwrite')
          if (values.progress) tx.objectStore('keyval').put(values.progress, 'progress')
          if (values.settings) tx.objectStore('keyval').put(values.settings, 'settings')
          tx.oncomplete = () => done()
        }
      }),
    values,
  )
  await page.goto('/')
}

// Runs `write` against the game's storage from a page where the game isn't running.
export async function withStorage(page: Page, write: () => Promise<void>) {
  await page.goto('/levels/index.json')
  await page.evaluate(write)
  await page.goto('/')
}
