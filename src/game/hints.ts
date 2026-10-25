import type { Level } from './level'
import { allCells, settle, visibleCells, type LevelProgress } from './level-state'

export type HintKind = 'lightbulb' | 'bullseye' | 'rocket'

// Coins are earned generously (bonus words, finishing levels, quizzes), so hints stay cheap.
export const HINT_COST: Record<HintKind, number> = { lightbulb: 10, bullseye: 20, rocket: 35 }
export const ROCKET_LETTERS = 5
// With relaxed hints on, a free lightbulb is offered after this long without finding a word.
export const RELAXED_HINT_AFTER_MS = 3 * 60 * 1000

export function hiddenCells(level: Level, progress: LevelProgress): string[] {
  const visible = visibleCells(level, progress)
  return [...allCells(level).keys()].filter((k) => !visible.has(k))
}

function reveal(level: Level, progress: LevelProgress, keys: string[]): LevelProgress {
  return settle(level, { ...progress, revealed: [...progress.revealed, ...keys] })
}

// Lightbulb: one random hidden letter.
export function lightbulb(level: Level, progress: LevelProgress, rng = Math.random): LevelProgress {
  const hidden = hiddenCells(level, progress)
  if (!hidden.length) return progress
  return reveal(level, progress, [hidden[Math.floor(rng() * hidden.length)]])
}

// Bullseye: the exact letter the player tapped.
export function bullseye(level: Level, progress: LevelProgress, key: string): LevelProgress {
  return hiddenCells(level, progress).includes(key) ? reveal(level, progress, [key]) : progress
}

// Rocket: up to five random hidden letters, spread across the grid.
export function rocket(level: Level, progress: LevelProgress, rng = Math.random): LevelProgress {
  const hidden = hiddenCells(level, progress)
  const picks: string[] = []
  while (picks.length < ROCKET_LETTERS && hidden.length) picks.push(hidden.splice(Math.floor(rng() * hidden.length), 1)[0])
  return picks.length ? reveal(level, progress, picks) : progress
}
