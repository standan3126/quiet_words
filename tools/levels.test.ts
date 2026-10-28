import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { canSpell, letterCounts, type LevelIndex, type Pack, type PlacedWord } from '../src/game/level.ts'
import { buildLayout, gridRuns, mulberry32 } from './crossword.ts'

const ROOT = join(import.meta.dirname, '..')
const readList = (file: string) =>
  readFileSync(join(ROOT, 'data', file), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l && !l.startsWith('#'))

const runKey = (p: PlacedWord) => `${p.word}@${p.x},${p.y},${p.dir}`

describe('crossword packer', () => {
  it('detects an accidental word between parallel neighbours', () => {
    const bad: PlacedWord[] = [
      { word: 'cat', x: 0, y: 0, dir: 'h' },
      { word: 'ox', x: 0, y: 1, dir: 'h' }, // spells "co" and "ax" downward
    ]
    expect(gridRuns(bad).map(runKey).sort()).not.toEqual(bad.map(runKey).sort())
  })

  it('lays out words so the only runs are the placed words', () => {
    const others = ['tone', 'note', 'stone', 'nest', 'sent', 'ten', 'son', 'one', 'set']
    const layout = buildLayout('stones', others, 6, { maxWidth: 9, maxHeight: 9 }, mulberry32(7))
    expect(layout.words.length).toBeGreaterThanOrEqual(4)
    expect(gridRuns(layout.words).map(runKey).sort()).toEqual(layout.words.map(runKey).sort())
  })
})

const levelDir = join(ROOT, 'public', 'levels')
describe.runIf(existsSync(join(levelDir, 'index.json')))('generated levels', () => {
  const index: LevelIndex = JSON.parse(readFileSync(join(levelDir, 'index.json'), 'utf8'))
  const packs: Pack[] = readdirSync(levelDir)
    .filter((f) => f.startsWith('pack-'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(levelDir, f), 'utf8')))
  const journeyLevels = packs.flatMap((p) => p.levels)
  const levels = journeyLevels
  const answers = new Set(readList('answers.txt'))
  const valid = new Set(readList('valid.txt'))
  const banned = new Set([...readList('blocklist.txt'), ...readList('raw/profanity_en.txt')])

  it('index matches the pack files', () => {
    expect(index.packs.length).toBe(packs.length)
    expect(index.totalLevels).toBe(journeyLevels.length)
    expect(journeyLevels.map((l) => l.id)).toEqual(journeyLevels.map((_, i) => i + 1))
  })

  it('every level is fair and well formed', () => {
    const wheels = new Set<string>()
    for (const level of levels) {
      const ctx = `level ${level.id}`
      const counts = letterCounts(level.letters)
      const words = level.words.map((p) => p.word)

      expect(words.length, ctx).toBeGreaterThanOrEqual(2)
      expect(new Set(words).size, `${ctx}: repeated answer`).toBe(words.length)
      for (const w of words) {
        expect(answers.has(w), `${ctx}: "${w}" is not a common word`).toBe(true)
        expect(banned.has(w), `${ctx}: "${w}" is blocklisted`).toBe(false)
        expect(canSpell(w, counts), `${ctx}: "${w}" not on wheel`).toBe(true)
      }
      expect(words, `${ctx}: wheel starts out spelling an answer`).not.toContain(level.letters)

      // Grid shows exactly the answers: no accidental words, nothing missing.
      expect(gridRuns(level.words).map(runKey).sort(), ctx).toEqual(level.words.map(runKey).sort())
      expect(level.width, ctx).toBeLessThanOrEqual(9)
      expect(level.height, ctx).toBeLessThanOrEqual(9)

      for (const w of level.extras) {
        expect(valid.has(w), `${ctx}: bonus "${w}" invalid`).toBe(true)
        expect(words, `${ctx}: bonus "${w}" is also an answer`).not.toContain(w)
        expect(canSpell(w, counts), `${ctx}: bonus "${w}" not on wheel`).toBe(true)
      }

      const wheel = [...level.letters].sort().join('')
      expect(wheels.has(wheel), `${ctx}: wheel reused`).toBe(false)
      wheels.add(wheel)
    }
  })

  it('every answer has a definition to show when tapped', () => {
    const defs: Record<string, string> = JSON.parse(readFileSync(join(ROOT, 'public', 'definitions.json'), 'utf8'))
    const missing = [...new Set(levels.flatMap((l) => l.words.map((p) => p.word)))].filter((w) => !defs[w])
    expect(missing).toEqual([])
  })

  it('later levels sometimes have a challenge word, on its own row', () => {
    const challenged = journeyLevels.filter((l) => l.words.some((p) => p.challenge))
    expect(challenged.length).toBeGreaterThan(50)
    expect(challenged.every((l) => l.id >= 100)).toBe(true)
    for (const l of challenged) {
      const c = l.words.find((p) => p.challenge)!
      const lowest = Math.max(...l.words.filter((p) => !p.challenge).map((p) => (p.dir === 'v' ? p.y + p.word.length - 1 : p.y)))
      expect(c.y, `level ${l.id}`).toBe(lowest + 2) // one empty row between
    }
  })

  it('every word in the grid is connected', () => {
    for (const level of levels) {
      const cells = (p: PlacedWord) =>
        [...p.word].map((_, i) => (p.dir === 'h' ? `${p.x + i},${p.y}` : `${p.x},${p.y + i}`))
      // Challenge words sit apart on purpose; everything else must interlock.
      const body = level.words.filter((p) => !p.challenge)
      const reached = new Set(cells(body[0]))
      let grew = true
      const left = body.slice(1)
      while (grew) {
        grew = false
        for (let i = left.length - 1; i >= 0; i--) {
          const c = cells(left[i])
          if (c.some((k) => reached.has(k))) {
            c.forEach((k) => reached.add(k))
            left.splice(i, 1)
            grew = true
          }
        }
      }
      expect(left.map((p) => p.word), `level ${level.id}: disconnected words`).toEqual([])
    }
  })
})
