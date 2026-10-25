// Level data format, shared by the offline generator (tools/) and the game.

export type Direction = 'h' | 'v'

export interface PlacedWord {
  word: string
  x: number
  y: number
  dir: Direction
  challenge?: true // a detached row with no crossings to help; pays a coin per letter
}

export interface Level {
  id: number // 1-based, global across all packs
  letters: string // wheel letters in their starting order
  words: PlacedWord[] // the crossword answers
  extras: string[] // every other valid word the wheel can spell (bonus words)
  width: number
  height: number
}

export interface Pack {
  id: number
  name: string
  journey: string
  levels: Level[]
}

export interface PackSummary {
  id: number
  name: string
  journey: string
  firstLevel: number
  levelCount: number
}

export interface LevelIndex {
  totalLevels: number
  packs: PackSummary[]
}

export function letterCounts(word: string): Uint8Array {
  const counts = new Uint8Array(26)
  for (let i = 0; i < word.length; i++) counts[word.charCodeAt(i) - 97]++
  return counts
}

// True if `word` can be spelled using each wheel letter at most once.
export function canSpell(word: string, available: Uint8Array): boolean {
  const used = new Uint8Array(26)
  for (let i = 0; i < word.length; i++) {
    const c = word.charCodeAt(i) - 97
    if (++used[c] > available[c]) return false
  }
  return true
}
