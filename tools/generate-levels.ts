// Generates the level packs from data/answers.txt and data/valid.txt.
// Output: public/levels/pack-NNN.json and public/levels/index.json
// Run: npm run levels -- [--packs N]   (default: every location in journeys.ts)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { canSpell, letterCounts, type Level, type LevelIndex, type Pack } from '../src/game/level.ts'
import { buildLayout, mulberry32, shuffle, type Limits, type Rng } from './crossword.ts'
import { journeys } from './journeys.ts'

const ROOT = join(import.meta.dirname, '..')
const OUT = join(ROOT, 'public', 'levels')
const LEVELS_PER_PACK = 15
// Fits a phone screen with comfortably large squares.
const LIMITS: Limits = { maxWidth: 9, maxHeight: 9 }

const readList = (file: string) => readFileSync(join(ROOT, 'data', file), 'utf8').split('\n').filter(Boolean)
const answers = readList('answers.txt') // most common first
const valid = readList('valid.txt')

// Wheel size grows slowly. Every 5th level dips one letter smaller as a breather.
function wheelLength(level: number): number {
  const bands: [number, number][] = [[601, 8], [201, 7], [61, 6], [21, 5], [6, 4], [1, 3]]
  const base = bands.find(([from]) => level >= from)![1]
  return level > 5 && level % 5 === 0 ? Math.max(3, base - 1) : base
}

// Answers come only from the most common words early on, widening gradually.
const rankCap = (level: number) => Math.min(12_000, 2_500 + level * 12)

const CHALLENGE_FROM = 100
const CHALLENGE_EVERY = 7

// How many words go in the grid for each wheel size: [min, max].
const wordTargets: Record<number, [number, number]> = { 3: [2, 3], 4: [3, 5], 5: [4, 6], 6: [5, 8], 7: [6, 10], 8: [7, 11] }

const sortedLetters = (w: string) => [...w].sort().join('')
const usedWheels = new Set<string>() // no two levels share the same set of letters

function makeLevel(id: number, rng: Rng, length = wheelLength(id), cap = rankCap(id)): Level {
  const [min, max] = wordTargets[length]
  // Later levels within a band lean toward fuller grids.
  const target = Math.min(max, min + Math.floor(rng() * (max - min + 1)))

  const bases = shuffle(
    answers.filter((w, i) => w.length === length && i < cap && !usedWheels.has(sortedLetters(w))),
    rng,
  )
  for (const base of bases) {
    const counts = letterCounts(base)
    // Already in most-common-first order, which buildLayout treats as preference.
    const others = answers.filter((w, i) => i < cap && w !== base && w.length <= length && canSpell(w, counts))
    if (others.length + 1 < min) continue

    const layout = buildLayout(base, others, target, LIMITS, rng)
    if (layout.words.length < min) continue

    usedWheels.add(sortedLetters(base))

    // Challenge word (from Wordscapes): now and then in later levels, one more common word on
    // a row of its own below the grid. Chosen without the RNG so nothing else about the level changes.
    let { width, height } = layout
    const words = [...layout.words]
    if (id >= CHALLENGE_FROM && id % CHALLENGE_EVERY === 0 && height + 2 <= LIMITS.maxHeight) {
      // Not hiding inside a grid word ("siren" next to "sirens"), or it's no challenge.
      const word = others.find((w) => w.length >= 4 && !words.some((p) => p.word.includes(w)))
      if (word) {
        words.push({ word, x: 0, y: height + 1, dir: 'h', challenge: true })
        width = Math.max(width, word.length)
        height += 2
      }
    }
    const placed = new Set(words.map((p) => p.word))
    const extras = valid.filter((w) => w.length <= length && !placed.has(w) && canSpell(w, counts))

    // Start the wheel in an order that doesn't already spell an answer.
    let letters = base
    for (let i = 0; i < 20 && (placed.has(letters) || letters === base); i++) letters = shuffle([...base], rng).join('')

    return { id, letters, words, extras, width, height }
  }
  throw new Error(`No playable wheel found for level ${id} (length ${length}, cap ${cap})`)
}

const locations = journeys.flatMap((j) => j.locations.map((name) => ({ name, journey: j.name })))
const packArg = process.argv.indexOf('--packs')
const packCount = packArg > 0 ? Math.min(Number(process.argv[packArg + 1]), locations.length) : locations.length

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const index: LevelIndex = { totalLevels: 0, packs: [] }

for (let p = 0; p < packCount; p++) {
  const pack: Pack = { id: p + 1, ...locations[p], levels: [] }
  for (let i = 0; i < LEVELS_PER_PACK; i++) {
    const id = p * LEVELS_PER_PACK + i + 1
    pack.levels.push(makeLevel(id, mulberry32(id * 2654435761)))
  }
  const file = `pack-${String(pack.id).padStart(3, '0')}.json`
  writeFileSync(join(OUT, file), JSON.stringify(pack))
  index.packs.push({ id: pack.id, name: pack.name, journey: pack.journey, firstLevel: pack.levels[0].id, levelCount: pack.levels.length })
  index.totalLevels += pack.levels.length
}

writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 1))

console.log(`${index.packs.length} packs, ${index.totalLevels} levels`)
