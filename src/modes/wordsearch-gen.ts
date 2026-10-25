// Themed word searches for the breaks between levels. Every search has words across, down and
// diagonally, read both forwards and backwards. Seeded, so a break looks the same if reopened.

export const THEMES: { name: string; words: string[] }[] = [
  { name: 'Birds', words: ['robin', 'wren', 'finch', 'heron', 'owl', 'sparrow', 'swallow', 'crane', 'dove', 'lark', 'eagle', 'jay'] },
  { name: 'Trees', words: ['oak', 'maple', 'birch', 'willow', 'cedar', 'pine', 'aspen', 'elm', 'spruce', 'alder', 'beech', 'larch'] },
  { name: 'Flowers', words: ['daisy', 'rose', 'tulip', 'lily', 'poppy', 'violet', 'aster', 'iris', 'lilac', 'peony', 'orchid', 'clover'] },
  { name: 'Weather', words: ['rain', 'cloud', 'breeze', 'mist', 'frost', 'thunder', 'drizzle', 'rainbow', 'snow', 'sunny', 'fog', 'dew'] },
  { name: 'By the sea', words: ['shell', 'wave', 'coral', 'tide', 'kelp', 'crab', 'starfish', 'otter', 'whale', 'seal', 'pearl', 'sand'] },
  { name: 'In the garden', words: ['rake', 'seed', 'soil', 'hose', 'bulb', 'sprout', 'bloom', 'trowel', 'shed', 'gate', 'pea', 'basket'] },
  { name: 'Forest friends', words: ['deer', 'fox', 'badger', 'rabbit', 'squirrel', 'moose', 'beaver', 'hedgehog', 'mole', 'bear', 'vole', 'owl'] },
  { name: 'Camping', words: ['tent', 'lantern', 'campfire', 'canoe', 'trail', 'compass', 'cocoa', 'map', 'cabin', 'kayak', 'hike', 'blanket'] },
  { name: 'Fruit', words: ['apple', 'pear', 'plum', 'cherry', 'peach', 'grape', 'melon', 'lemon', 'mango', 'berry', 'fig', 'kiwi'] },
  { name: 'Night sky', words: ['moon', 'star', 'comet', 'planet', 'dawn', 'dusk', 'sunset', 'aurora', 'meteor', 'orbit', 'galaxy', 'twinkle'] },
  { name: 'Baking', words: ['bread', 'scone', 'butter', 'honey', 'jam', 'kettle', 'muffin', 'pie', 'flour', 'teapot', 'crumb', 'oven'] },
  { name: 'Seasons', words: ['spring', 'summer', 'autumn', 'winter', 'harvest', 'blossom', 'snowfall', 'solstice', 'thaw', 'bloom', 'frost', 'leaves'] },
]

export const SIZE = 8
const WORDS_PER_SEARCH = 7
type Step = [number, number]
const ACROSS: Step = [1, 0]
const DOWN: Step = [0, 1]
const LEFT: Step = [-1, 0]
const UP: Step = [0, -1]
const DIAGONALS: Step[] = [[1, 1], [1, -1]] // reading left to right
const BACK_DIAGONALS: Step[] = [[-1, 1], [-1, -1]]
const ALL: Step[] = [ACROSS, DOWN, LEFT, UP, ...DIAGONALS, ...BACK_DIAGONALS]
// Filler letters weighted toward common ones, so the grid reads like gentle noise.
const FILLER = 'eeeeaaaoooiiinnnsssrrrtttlllddhhcumwfgypbvk'

export interface SearchWord {
  word: string
  cells: [number, number][]
}

export interface Search {
  theme: string
  rows: string[]
  words: SearchWord[]
}

function rng(seed: number) {
  let a = (seed * 2654435761 + 99) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Fisher-Yates with the seeded generator: sorting with a random comparison isn't
// repeatable across browsers.
function shuffle<T>(items: T[], r: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export const axisOf = ([dx, dy]: Step) => (dx && dy ? 'diagonal' : dx ? 'horizontal' : 'vertical')
// Backwards means right to left, or straight up the page.
export const isBackwards = ([dx, dy]: Step) => dx < 0 || (dx === 0 && dy < 0)

// Every search has words across, down and diagonal, and at least two backwards ones
// running different ways, with at least two read forwards too.
export function isVaried(words: SearchWord[]): boolean {
  const steps = words.map(({ cells: [a, b] }): Step => [b[0] - a[0], b[1] - a[1]])
  const back = steps.filter(isBackwards)
  return (
    new Set(steps.map(axisOf)).size === 3 &&
    back.length >= 2 &&
    new Set(back.map(axisOf)).size >= 2 &&
    steps.length - back.length >= 2
  )
}

function attempt(pool: string[], r: () => number): SearchWord[] {
  const grid: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  // Every spot where a word fits going one way.
  const spots = (word: string, [dx, dy]: Step) => {
    const found: [number, number][][] = []
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        const cells: [number, number][] = [...word].map((_, i) => [x + dx * i, y + dy * i])
        if (cells.every(([cx, cy], i) => cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && (grid[cy][cx] === null || grid[cy][cx] === word[i]))) found.push(cells)
      }
    return found
  }
  // One word each way the search needs, plus one free choice, handed out in a random order.
  const pick = (steps: Step[]) => steps[Math.floor(r() * steps.length)]
  let plan = shuffle([ACROSS, DOWN, pick(DIAGONALS), LEFT, UP, pick(BACK_DIAGONALS), pick(ALL)], r)
  const words: SearchWord[] = []
  // Longest first, while the grid is emptiest.
  for (const word of [...pool].sort((a, b) => b.length - a.length)) {
    if (words.length === WORDS_PER_SEARCH) break
    // A planned direction if one fits, otherwise any direction at all.
    for (const step of [...plan, ...shuffle(ALL, r)]) {
      const options = spots(word, step)
      if (!options.length) continue
      const cells = options[Math.floor(r() * options.length)]
      cells.forEach(([cx, cy], i) => (grid[cy][cx] = word[i]))
      words.push({ word, cells })
      plan = plan.filter((p) => p !== step)
      break
    }
  }
  return words
}

// `seed` is the level the break follows; `breakNumber` picks the theme, so themes take turns.
export function makeSearch(seed: number, breakNumber: number): Search {
  const r = rng(seed)
  const theme = THEMES[breakNumber % THEMES.length]
  // Crowded grids occasionally miss a direction; lay the words out again until none is missing.
  let words: SearchWord[] = []
  for (let tries = 0; tries < 40; tries++) {
    words = attempt(shuffle(theme.words, r).slice(0, WORDS_PER_SEARCH + 2), r)
    if (words.length >= WORDS_PER_SEARCH - 1 && isVaried(words)) break
  }

  const grid: string[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  for (const { word, cells } of words) cells.forEach(([x, y], i) => (grid[y][x] = word[i]))
  const rows = grid.map((row) => row.map((c) => c || FILLER[Math.floor(r() * FILLER.length)]).join(''))
  return { theme: theme.name, rows, words: words.sort((a, b) => a.word.localeCompare(b.word)) }
}

// The cells along a straight line from `a` toward `b`, snapped to the nearest of the
// eight directions, so a slightly wobbly swipe still selects a clean line.
export function lineCells(a: [number, number], b: [number, number]): [number, number][] {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const length = Math.max(Math.abs(dx), Math.abs(dy))
  if (!length) return [a]
  const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
  const sx = Math.round(Math.cos(angle))
  const sy = Math.round(Math.sin(angle))
  const cells: [number, number][] = []
  for (let i = 0; i <= length; i++) {
    const x = a[0] + sx * i
    const y = a[1] + sy * i
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) break
    cells.push([x, y])
  }
  return cells
}
