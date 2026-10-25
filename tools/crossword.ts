// Crossword layout: packs a list of words into a compact, fully interlocked grid.
import type { Direction, PlacedWord } from '../src/game/level.ts'

export type Rng = () => number

// Small seeded PRNG so every build produces the same levels.
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const H = 1
const V = 2
const key = (x: number, y: number) => `${x},${y}`
const step = (dir: Direction) => (dir === 'h' ? [1, 0] : [0, 1])

export interface Limits {
  maxWidth: number
  maxHeight: number
}

class Board {
  letters = new Map<string, string>()
  dirs = new Map<string, number>() // which directions already pass through each cell
  words: PlacedWord[] = []
  minX = Infinity
  maxX = -Infinity
  minY = Infinity
  maxY = -Infinity

  get width() {
    return this.words.length ? this.maxX - this.minX + 1 : 0
  }
  get height() {
    return this.words.length ? this.maxY - this.minY + 1 : 0
  }
  get crossings() {
    let n = 0
    for (const d of this.dirs.values()) if (d === (H | V)) n++
    return n
  }

  private filled(x: number, y: number) {
    return this.letters.has(key(x, y))
  }

  // Number of letters the word would share with the grid, or -1 if it can't go here.
  // A word may only touch the grid where it crosses; any other contact would spell
  // accidental words, so parallel neighbours and the cells at both ends must be empty.
  fit(word: string, x: number, y: number, dir: Direction, limits: Limits): number {
    const [dx, dy] = step(dir)
    const bit = dir === 'h' ? H : V
    const end = word.length - 1
    if (this.filled(x - dx, y - dy) || this.filled(x + dx * (end + 1), y + dy * (end + 1))) return -1

    let crossings = 0
    for (let i = 0; i <= end; i++) {
      const cx = x + dx * i
      const cy = y + dy * i
      const existing = this.letters.get(key(cx, cy))
      if (existing !== undefined) {
        if (existing !== word[i] || (this.dirs.get(key(cx, cy))! & bit)) return -1
        crossings++
      } else if (this.filled(cx + dy, cy + dx) || this.filled(cx - dy, cy - dx)) {
        return -1
      }
    }
    if (this.words.length > 0 && crossings === 0) return -1

    const width = Math.max(this.maxX, x + dx * end) - Math.min(this.minX, x) + 1
    const height = Math.max(this.maxY, y + dy * end) - Math.min(this.minY, y) + 1
    if (width > limits.maxWidth || height > limits.maxHeight) return -1
    return crossings
  }

  place(word: string, x: number, y: number, dir: Direction) {
    const [dx, dy] = step(dir)
    const bit = dir === 'h' ? H : V
    for (let i = 0; i < word.length; i++) {
      const k = key(x + dx * i, y + dy * i)
      this.letters.set(k, word[i])
      this.dirs.set(k, (this.dirs.get(k) ?? 0) | bit)
    }
    this.words.push({ word, x, y, dir })
    this.minX = Math.min(this.minX, x)
    this.minY = Math.min(this.minY, y)
    this.maxX = Math.max(this.maxX, x + dx * (word.length - 1))
    this.maxY = Math.max(this.maxY, y + dy * (word.length - 1))
  }

  // Best spot for a word, favouring many crossings and little growth of the grid.
  bestSpot(word: string, limits: Limits, rng: Rng) {
    let best: { x: number; y: number; dir: Direction; score: number } | undefined
    const area = this.width * this.height
    for (const [k, letter] of this.letters) {
      const [cx, cy] = k.split(',').map(Number)
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== letter) continue
        for (const dir of ['h', 'v'] as const) {
          const [dx, dy] = step(dir)
          const x = cx - dx * i
          const y = cy - dy * i
          const crossings = this.fit(word, x, y, dir, limits)
          if (crossings < 0) continue
          const w = Math.max(this.maxX, x + dx * (word.length - 1)) - Math.min(this.minX, x) + 1
          const h = Math.max(this.maxY, y + dy * (word.length - 1)) - Math.min(this.minY, y) + 1
          const score = crossings * 6 - (w * h - area) * 0.4 - Math.abs(w - h) * 0.8 + rng() * 2
          if (!best || score > best.score) best = { x, y, dir, score }
        }
      }
    }
    return best
  }
}

export interface Layout {
  words: PlacedWord[]
  width: number
  height: number
}

// Places words in order (the first goes down unconditionally), stopping at `target` words.
// Words that don't fit are skipped; they still count as bonus words in the game.
function attempt(order: string[], target: number, limits: Limits, rng: Rng): Board {
  const board = new Board()
  board.place(order[0], 0, 0, 'h')
  for (const word of order.slice(1)) {
    if (board.words.length >= target) break
    const spot = board.bestSpot(word, limits, rng)
    if (spot) board.place(word, spot.x, spot.y, spot.dir)
  }
  return board
}

// Tries several word orders and keeps the fullest, most interlocked, most compact layout.
// `base` always goes first; `others` should be given most-preferred first.
export function buildLayout(base: string, others: string[], target: number, limits: Limits, rng: Rng, tries = 30): Layout {
  let best: Board | undefined
  let bestScore = -Infinity
  for (let t = 0; t < tries; t++) {
    // Keep the preference order loosely: nudge each word by a random amount.
    const order = others
      .map((w, i) => ({ w, k: i + rng() * others.length * 0.5 }))
      .sort((a, b) => a.k - b.k)
      .map((e) => e.w)
    const board = attempt([base, ...order], target, limits, rng)
    const score = board.words.length * 100 + board.crossings * 4 - board.width * board.height * 0.5 - Math.abs(board.width - board.height) * 2
    if (score > bestScore) {
      best = board
      bestScore = score
    }
  }
  const b = best!
  return {
    words: b.words.map((p) => ({ ...p, x: p.x - b.minX, y: p.y - b.minY })),
    width: b.width,
    height: b.height,
  }
}

// Every maximal horizontal and vertical run of 2+ letters in a laid-out grid.
// A correct layout has exactly one run per placed word and nothing else.
export function gridRuns(words: PlacedWord[]): PlacedWord[] {
  const cells = new Map<string, string>()
  for (const p of words) {
    const [dx, dy] = step(p.dir)
    for (let i = 0; i < p.word.length; i++) cells.set(key(p.x + dx * i, p.y + dy * i), p.word[i])
  }
  const runs: PlacedWord[] = []
  for (const dir of ['h', 'v'] as const) {
    const [dx, dy] = step(dir)
    for (const k of cells.keys()) {
      const [x, y] = k.split(',').map(Number)
      if (cells.has(key(x - dx, y - dy))) continue // not the start of a run
      let word = ''
      for (let i = 0; cells.has(key(x + dx * i, y + dy * i)); i++) word += cells.get(key(x + dx * i, y + dy * i))
      if (word.length >= 2) runs.push({ word, x, y, dir })
    }
  }
  return runs
}
