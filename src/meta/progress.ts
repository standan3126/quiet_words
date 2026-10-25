import type { LevelProgress } from '../game/level-state'
import type { Break, BreakKind } from './breaks'
import { load, save } from './storage'

export interface DailyState {
  date: string // YYYY-MM-DD, local time
  current: LevelProgress
}

// Playing a finished place's levels again, picked from its postcard. Kept apart from the
// journey so it never moves the player's place in it.
export interface Revisit {
  packId: number
  level: number
  current: LevelProgress | null
}

export interface Progress {
  level: number // the level being played (or next to play)
  coins: number
  current: LevelProgress | null // saved mid-level state, so closing the app loses nothing
  pendingBreak: Break | null
  breakNext: Partial<Record<BreakKind, number>> // how far through each break's questions, so none repeat until all are seen
  daily: DailyState | null
  flowers: string[] // dates of finished daily puzzles; each is a pressed flower in Postcards
  revisit: Revisit | null
  stats: { levelsDone: number; wordsFound: number; bonusFound: number; skipped: number }
}

export type Stats = Progress['stats']

export function addStats(stats: Stats, delta: Partial<Stats>): Stats {
  return {
    levelsDone: stats.levelsDone + (delta.levelsDone ?? 0),
    wordsFound: stats.wordsFound + (delta.wordsFound ?? 0),
    bonusFound: stats.bonusFound + (delta.bonusFound ?? 0),
    skipped: stats.skipped + (delta.skipped ?? 0),
  }
}

export const STARTING_COINS = 50
export const COINS_PER_BONUS = 2
export const COINS_PER_LEVEL = 5
export const COINS_PER_DAILY = 10
export const COINS_BUTTERFLY = 10
export const COINS_QUIZ_RIGHT = 3
export const COINS_QUIZ_TRY = 1 // a wrong answer still earns something
export const COINS_SEARCH_WORD = 1
export const COINS_SEARCH_DONE = 5

export const defaultProgress: Progress = {
  level: 1,
  coins: STARTING_COINS,
  current: null,
  pendingBreak: null,
  breakNext: {},
  daily: null,
  flowers: [],
  revisit: null,
  stats: { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 },
}

const KEY = 'progress'

export async function loadProgress(): Promise<Progress> {
  const stored = await load<Partial<Progress> & { quizNext?: number }>(KEY, {})
  // Before there were many kinds of break, one grammar-and-spelling quiz kept a single place.
  const { quizNext, ...rest } = stored
  const breakNext = rest.breakNext ?? (quizNext ? { grammar: quizNext } : {})
  const pendingBreak = rest.pendingBreak && (rest.pendingBreak.kind as string) === 'quiz' ? { ...rest.pendingBreak, kind: 'grammar' as const } : rest.pendingBreak
  return { ...defaultProgress, ...rest, breakNext, pendingBreak: pendingBreak ?? null, stats: { ...defaultProgress.stats, ...rest.stats } }
}

export const saveProgress = (progress: Progress) => save(KEY, progress)
