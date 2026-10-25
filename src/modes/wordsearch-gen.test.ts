import { describe, expect, it } from 'vitest'
import { lineCells, makeSearch, SIZE, THEMES } from './wordsearch-gen'

describe('word search', () => {
  it('places every word along its cells, forwards, on an 8x8 grid', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const s = makeSearch(seed * 12, seed)
      expect(s.rows).toHaveLength(SIZE)
      s.rows.forEach((row) => expect(row).toMatch(/^[a-z]{8}$/))
      expect(s.words.length, `seed ${seed}`).toBeGreaterThanOrEqual(6)
      for (const w of s.words) expect(w.cells.map(([x, y]) => s.rows[y][x]).join('')).toBe(w.word)
    }
  })

  it('is the same every time for the same break', () => {
    expect(makeSearch(24, 2)).toEqual(makeSearch(24, 2))
  })

  it('only uses theme words that fit the grid', () => {
    for (const t of THEMES) for (const w of t.words) expect(w, t.name).toMatch(/^[a-z]{3,8}$/)
  })

  it('snaps a wobbly swipe to a straight line', () => {
    expect(lineCells([0, 0], [3, 1])).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]])
    expect(lineCells([0, 0], [3, 3])).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]])
    expect(lineCells([2, 5], [2, 2])).toEqual([[2, 5], [2, 4], [2, 3], [2, 2]])
  })
})
