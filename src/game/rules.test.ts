import { describe, expect, it } from 'vitest'
import { bullseye, hiddenCells, lightbulb, rocket } from './hints'
import type { Level } from './level'
import { emptyProgress, isLevelComplete } from './level-state'
import { applyOutcome, classify } from './validator'

// T E A
// · · T
//     E
const level: Level = {
  id: 1,
  letters: 'aet',
  words: [
    { word: 'tea', x: 0, y: 0, dir: 'h' },
    { word: 'ate', x: 2, y: 0, dir: 'v' },
  ],
  extras: ['eat', 'eta'],
  width: 3,
  height: 3,
}
const fresh = emptyProgress(1)

describe('classify', () => {
  it('sorts words into the four outcomes', () => {
    expect(classify('tea', level, fresh).kind).toBe('answer')
    expect(classify('eat', level, fresh).kind).toBe('bonus')
    expect(classify('tae', level, fresh).kind).toBe('invalid')
    expect(classify('at', level, fresh).kind).toBe('invalid') // too short
    const after = applyOutcome(classify('tea', level, fresh), level, fresh)
    expect(classify('tea', level, after)).toEqual({ kind: 'repeat', word: 'tea', inGrid: true })
    const withBonus = applyOutcome(classify('eat', level, after), level, after)
    expect(withBonus.bonus).toEqual(['eat'])
    expect(classify('eat', level, withBonus)).toEqual({ kind: 'repeat', word: 'eat', inGrid: false })
  })

  it('completes the level when every answer is found', () => {
    let p = applyOutcome(classify('tea', level, fresh), level, fresh)
    expect(isLevelComplete(level, p)).toBe(false)
    p = applyOutcome(classify('ate', level, p), level, p)
    expect(isLevelComplete(level, p)).toBe(true)
  })
})

describe('hints', () => {
  it('lightbulb reveals exactly one hidden letter', () => {
    const p = lightbulb(level, fresh, () => 0)
    expect(p.revealed).toHaveLength(1)
    expect(hiddenCells(level, p)).toHaveLength(4)
  })

  it('bullseye reveals the tapped cell and ignores visible ones', () => {
    const p = bullseye(level, fresh, '2,2')
    expect(p.revealed).toEqual(['2,2'])
    expect(bullseye(level, p, '2,2')).toBe(p)
  })

  it('revealing every letter of a word completes it', () => {
    const p = rocket(level, fresh, () => 0) // 5 cells: the whole grid
    expect(hiddenCells(level, p)).toHaveLength(0)
    expect(p.found.sort()).toEqual(['ate', 'tea'])
    expect(isLevelComplete(level, p)).toBe(true)
  })

  it('a word finished by hints counts as already found', () => {
    const p = bullseye(level, bullseye(level, bullseye(level, fresh, '0,0'), '1,0'), '2,0')
    expect(p.found).toEqual(['tea'])
    expect(classify('tea', level, p).kind).toBe('repeat')
  })
})
