import type { Level } from './level'
import { settle, type LevelProgress } from './level-state'

export const MIN_WORD = 3

export type Outcome =
  | { kind: 'answer'; word: string } // fills a word in the grid
  | { kind: 'bonus'; word: string } // a real word that isn't in the grid
  | { kind: 'repeat'; word: string; inGrid: boolean } // already found
  | { kind: 'invalid'; word: string } // not a word; fades away quietly

export function classify(word: string, level: Level, progress: LevelProgress): Outcome {
  if (word.length < MIN_WORD) return { kind: 'invalid', word }
  const inGrid = level.words.some((p) => p.word === word)
  if (inGrid) return progress.found.includes(word) ? { kind: 'repeat', word, inGrid } : { kind: 'answer', word }
  if (level.extras.includes(word)) return progress.bonus.includes(word) ? { kind: 'repeat', word, inGrid } : { kind: 'bonus', word }
  return { kind: 'invalid', word }
}

export function applyOutcome(outcome: Outcome, level: Level, progress: LevelProgress): LevelProgress {
  switch (outcome.kind) {
    case 'answer':
      return settle(level, { ...progress, found: [...progress.found, outcome.word] })
    case 'bonus':
      return { ...progress, bonus: [...progress.bonus, outcome.word] }
    default:
      return progress
  }
}
