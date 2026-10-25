// Themed word searches for the breaks between levels. Words only run forwards (across, down,
// or diagonally) to keep them restful. Seeded, so a break looks the same if reopened.

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
const DIRECTIONS: [number, number][] = [[1, 0], [0, 1], [1, 1], [1, -1]]
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

// `seed` is the level the break follows; themes take turns from one break to the next.
export function makeSearch(seed: number, breakNumber: number): Search {
  const r = rng(seed)
  const theme = THEMES[breakNumber % THEMES.length]
  const grid: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  // Fisher-Yates with the seeded generator: sorting with a random comparison isn't
  // repeatable across browsers.
  const pool = [...theme.words]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  pool.length = WORDS_PER_SEARCH + 2
  const words: SearchWord[] = []

  for (const word of pool.sort((a, b) => b.length - a.length)) {
    if (words.length === WORDS_PER_SEARCH) break
    for (let attempt = 0; attempt < 200; attempt++) {
      const [dx, dy] = DIRECTIONS[Math.floor(r() * DIRECTIONS.length)]
      const x = Math.floor(r() * SIZE)
      const y = Math.floor(r() * SIZE)
      const cells: [number, number][] = [...word].map((_, i) => [x + dx * i, y + dy * i])
      const fits = cells.every(([cx, cy], i) => cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && (grid[cy][cx] === null || grid[cy][cx] === word[i]))
      if (!fits) continue
      cells.forEach(([cx, cy], i) => (grid[cy][cx] = word[i]))
      words.push({ word, cells })
      break
    }
  }

  const rows = grid.map((row) => row.map((c) => c ?? FILLER[Math.floor(r() * FILLER.length)]).join(''))
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
