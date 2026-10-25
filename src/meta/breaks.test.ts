import { describe, expect, it } from 'vitest'
import { ALL_BREAK_KINDS, breakAfter } from './breaks'

describe('little game schedule', () => {
  it('comes after every so many levels, or never', () => {
    expect(breakAfter(6, 6, ALL_BREAK_KINDS)?.after).toBe(6)
    expect(breakAfter(7, 6, ALL_BREAK_KINDS)).toBeNull()
    expect(breakAfter(6, 0, ALL_BREAK_KINDS)).toBeNull()
    expect(breakAfter(6, 6, [])).toBeNull()
    for (let level = 1; level <= 20; level++) expect(breakAfter(level, 1, ALL_BREAK_KINDS)).not.toBeNull()
  })

  it('only picks ticked games, each once before any repeats', () => {
    const kinds = ['spelling', 'mistake', 'unscramble'] as const
    // Every 4 levels, so break n follows level 4n and rounds of three start at n = 3, 6, 9...
    for (let round = 1; round <= 10; round++) {
      const picked = [0, 1, 2].map((i) => breakAfter((round * 3 + i) * 4, 4, [...kinds])?.kind)
      expect(new Set(picked).size).toBe(3)
      for (const k of picked) expect(kinds).toContain(k)
    }
  })

  it('mixes the order up from one round to the next', () => {
    const firsts = new Set(Array.from({ length: 20 }, (_, round) => breakAfter((round + 1) * ALL_BREAK_KINDS.length, 1, ALL_BREAK_KINDS)?.kind))
    expect(firsts.size).toBeGreaterThan(2)
  })
})
