import type { Level, PlacedWord } from './level'

// Everything the player has done in one level. Saved after every word.
export interface LevelProgress {
  levelId: number
  found: string[] // answers completed, by swiping or by hints revealing every letter
  bonus: string[]
  revealed: string[] // cell keys uncovered by hints
}

export const emptyProgress = (levelId: number): LevelProgress => ({ levelId, found: [], bonus: [], revealed: [] })

export const cellKey = (x: number, y: number) => `${x},${y}`

export function wordCells(p: PlacedWord): string[] {
  return [...p.word].map((_, i) => (p.dir === 'h' ? cellKey(p.x + i, p.y) : cellKey(p.x, p.y + i)))
}

export interface Cell {
  x: number
  y: number
  letter: string
}

export function allCells(level: Level): Map<string, Cell> {
  const cells = new Map<string, Cell>()
  for (const p of level.words) {
    wordCells(p).forEach((k, i) => {
      const [x, y] = k.split(',').map(Number)
      cells.set(k, { x, y, letter: p.word[i] })
    })
  }
  return cells
}

// Cells whose letter is currently showing: part of a found word, or revealed by a hint.
export function visibleCells(level: Level, progress: LevelProgress): Set<string> {
  const visible = new Set(progress.revealed)
  for (const p of level.words) if (progress.found.includes(p.word)) wordCells(p).forEach((k) => visible.add(k))
  return visible
}

// Hints can uncover every letter of a word; that word then counts as found.
export function settle(level: Level, progress: LevelProgress): LevelProgress {
  const visible = visibleCells(level, progress)
  const newlyComplete = level.words
    .filter((p) => !progress.found.includes(p.word) && wordCells(p).every((k) => visible.has(k)))
    .map((p) => p.word)
  return newlyComplete.length ? { ...progress, found: [...progress.found, ...newlyComplete] } : progress
}

export const isLevelComplete = (level: Level, progress: LevelProgress) =>
  level.words.every((p) => progress.found.includes(p.word))
