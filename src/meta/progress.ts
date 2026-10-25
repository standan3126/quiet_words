import type { LevelProgress } from '../game/level-state'
import { load, save } from './storage'

// A short untimed break between journey levels.
export interface Break {
  kind: 'quiz' | 'wordsearch'
  after: number // the level it follows; also seeds the word search
}

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
  quizNext: number // position in the quiz bank, so questions don't repeat until all are seen
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
export const QUIZ_EVERY = 8 // levels
export const SEARCH_EVERY = 12

// Which break, if any, follows a journey level.
export function breakAfter(level: number): Break | null {
  if (level % QUIZ_EVERY === 0) return { kind: 'quiz', after: level }
  if (level % SEARCH_EVERY === 0) return { kind: 'wordsearch', after: level }
  return null
}

export const defaultProgress: Progress = {
  level: 1,
  coins: STARTING_COINS,
  current: null,
  pendingBreak: null,
  quizNext: 0,
  daily: null,
  flowers: [],
  revisit: null,
  stats: { levelsDone: 0, wordsFound: 0, bonusFound: 0, skipped: 0 },
}

const KEY = 'progress'

export async function loadProgress(): Promise<Progress> {
  const stored = await load<Partial<Progress>>(KEY, {})
  return { ...defaultProgress, ...stored, stats: { ...defaultProgress.stats, ...stored.stats } }
}

export const saveProgress = (progress: Progress) => save(KEY, progress)
