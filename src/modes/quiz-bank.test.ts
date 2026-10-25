import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './quiz-bank'

describe('quiz bank', () => {
  it('has well formed questions', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(150)
    for (const q of QUESTIONS) {
      expect(new Set(q.choices.map((c) => c.toLowerCase())).size, q.prompt).toBe(3)
      if (q.prompt !== 'Which spelling is right?') expect(q.prompt.split('___').length - 1, q.prompt).toBe(1)
      for (const c of q.choices) expect(c.trim(), q.prompt).toBe(c)
    }
  })

  it('never asks the same thing twice', () => {
    const keys = QUESTIONS.map((q) => q.prompt + '|' + q.choices[0])
    expect(new Set(keys).size).toBe(keys.length)
  })
})
