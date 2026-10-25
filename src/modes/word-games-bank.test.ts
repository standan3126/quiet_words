import { describe, expect, it } from 'vitest'
import { MISTAKES, PUNCTUATION, SENTENCES, SPEECH } from './word-games-bank'

describe('word game banks', () => {
  it('marks one real word to tap in every sentence', () => {
    for (const q of [...MISTAKES, ...SPEECH]) {
      const text = q.words.join(' ')
      expect(q.answer, text).toBeGreaterThanOrEqual(0)
      expect(q.words[q.answer], text).toMatch(/[a-z]/i)
      expect(text, text).not.toContain('*')
    }
    for (const q of MISTAKES) expect(q.fix, q.words.join(' ')).toBeTruthy()
    expect(MISTAKES.length).toBeGreaterThanOrEqual(30)
    expect(SPEECH.length).toBeGreaterThanOrEqual(30)
  })

  it('offers three different punctuation choices', () => {
    expect(PUNCTUATION.length).toBeGreaterThanOrEqual(25)
    for (const q of PUNCTUATION) expect(new Set(q.choices).size, q.choices[0]).toBe(3)
  })

  it('has sentences worth building', () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(30)
    expect(new Set(SENTENCES).size).toBe(SENTENCES.length)
    for (const s of SENTENCES) {
      expect(s.split(' ').length, s).toBeGreaterThanOrEqual(4)
      expect(s, s).toMatch(/^[A-Z].*[.!?]$/)
    }
  })
})
