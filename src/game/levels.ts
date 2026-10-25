import type { Level, LevelIndex, Pack, PackSummary } from './level'

const base = import.meta.env.BASE_URL
let indexPromise: Promise<LevelIndex> | undefined
const packs = new Map<number, Promise<Pack>>()

export function loadIndex(): Promise<LevelIndex> {
  indexPromise ??= fetch(`${base}levels/index.json`).then((r) => r.json())
  return indexPromise
}

function loadPack(id: number): Promise<Pack> {
  let pack = packs.get(id)
  if (!pack) {
    pack = fetch(`${base}levels/pack-${String(id).padStart(3, '0')}.json`).then((r) => r.json())
    packs.set(id, pack)
  }
  return pack
}

export interface LoadedLevel {
  level: Level
  pack: PackSummary
  isLastInPack: boolean
}

// Returns undefined once the player is past the last generated level.
export async function loadLevel(id: number): Promise<LoadedLevel | undefined> {
  const index = await loadIndex()
  const summary = index.packs.find((p) => id >= p.firstLevel && id < p.firstLevel + p.levelCount)
  if (!summary) return undefined
  const pack = await loadPack(summary.id)
  const level = pack.levels.find((l) => l.id === id)!
  return { level, pack: summary, isLastInPack: id === summary.firstLevel + summary.levelCount - 1 }
}
