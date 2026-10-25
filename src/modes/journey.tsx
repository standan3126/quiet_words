// The main journey: one level after another through the locations, with an untimed little
// game between levels as often as the player likes. Also plays a finished place again from its postcard,
// without breaks and without moving the journey along.
import { useEffect, useState } from 'preact/hooks'
import { emptyProgress, type LevelProgress } from '../game/level-state'
import { loadLevel, type LoadedLevel } from '../game/levels'
import { breakAfter } from '../meta/breaks'
import { addStats, COINS_PER_LEVEL, type Progress, type Stats } from '../meta/progress'
import type { Settings } from '../meta/settings'
import type { SleepMinutes } from '../ui/sleep-timer'
import { Board } from './board'
import { WordBreak } from './word-break'
import { WordSearch } from './wordsearch'

interface Props {
  progress: Progress
  settings: Settings
  sleepMinutes: SleepMinutes
  onProgress: (update: (p: Progress) => Progress) => void
  onSettings: (patch: Partial<Settings>) => void
  onSleep: (minutes: SleepMinutes) => void
  onHome: () => void
  onPostcards: () => void
}

export function Journey({ progress, onProgress, onPostcards, ...common }: Props) {
  const { settings } = common
  const [loaded, setLoaded] = useState<LoadedLevel | 'end' | null>(null)
  const visit = progress.revisit
  const levelId = visit ? visit.level : progress.level
  const lp = visit ? visit.current : progress.current

  // Saved mid-level state lives with the journey, or with the revisit while there is one.
  const withCurrent = (p: Progress, current: LevelProgress | null): Progress =>
    p.revisit ? { ...p, revisit: { ...p.revisit, current } } : { ...p, current }

  useEffect(() => {
    let cancelled = false
    setLoaded(null)
    loadLevel(levelId).then((l) => {
      if (cancelled) return
      if (!l) return setLoaded('end')
      if (lp?.levelId !== l.level.id) onProgress((p) => withCurrent(p, emptyProgress(l.level.id)))
      setLoaded(l)
    })
    return () => {
      cancelled = true
    }
  }, [levelId])

  const brk = progress.pendingBreak
  if (brk && !visit) {
    // Each game keeps its own place, so its questions (or a search's theme) don't repeat soon.
    const start = progress.breakNext[brk.kind] ?? 0
    const finishBreak = (coins: number, asked: number) =>
      onProgress((p) => ({ ...p, coins: p.coins + coins, pendingBreak: null, breakNext: { ...p.breakNext, [brk.kind]: start + asked } }))
    return brk.kind === 'wordsearch' ? (
      <WordSearch seed={brk.after} breakNumber={start} onDone={(c) => finishBreak(c, 1)} />
    ) : (
      <WordBreak kind={brk.kind} start={start} onDone={finishBreak} />
    )
  }

  if (loaded === 'end') {
    return (
      <main class="play">
        <div class="end panel">
          <h2>You've walked every trail</h2>
          <p class="soft">That's every level for now. Thank you for playing.</p>
          <button class="primary-button" onClick={common.onHome}>
            Home
          </button>
        </div>
      </main>
    )
  }

  if (!loaded || !lp || lp.levelId !== loaded.level.id) return <main class="play" aria-busy="true" />
  const { level, pack, isLastInPack } = loaded

  const commit = (next: LevelProgress, coins: number, stats: Partial<Stats>) =>
    onProgress((p) => ({ ...withCurrent(p, next), coins: p.coins + coins, stats: addStats(p.stats, stats) }))

  const nextLevel = (skipped: boolean) => {
    if (visit) {
      // The end of a revisit leads back to the postcards.
      if (isLastInPack) {
        onProgress((p) => ({ ...p, revisit: null }))
        return onPostcards()
      }
      return onProgress((p) => (p.revisit ? { ...p, revisit: { ...p.revisit, level: p.revisit.level + 1, current: null } } : p))
    }
    onProgress((p) => ({
      ...p,
      level: p.level + 1,
      current: null,
      pendingBreak: breakAfter(p.level, settings.breakEvery, settings.breakKinds),
      stats: addStats(p.stats, { skipped: skipped ? 1 : 0 }),
    }))
  }

  const note = visit ? (isLastInPack ? `That's ${pack.name} again · back to your postcards` : `Visiting ${pack.name} again`) : isLastInPack ? `You've finished ${pack.name} · a new postcard` : pack.name

  return (
    <Board
      key={level.id}
      {...common}
      level={level}
      title={pack.name}
      subtitle={visit ? `Level ${level.id - pack.firstLevel + 1} of ${pack.levelCount} · visiting again` : `Level ${level.id}`}
      lp={lp}
      coins={progress.coins}
      completionCoins={COINS_PER_LEVEL}
      finishedNote={note}
      onCommit={commit}
      onSkip={() => nextLevel(true)}
      onContinue={() => nextLevel(false)}
    />
  )
}
