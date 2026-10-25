// The main journey: one level after another through the locations, with an untimed quiz
// or word search break every so often.
import { useEffect, useState } from 'preact/hooks'
import { emptyProgress, type LevelProgress } from '../game/level-state'
import { loadLevel, type LoadedLevel } from '../game/levels'
import { addStats, breakAfter, COINS_PER_LEVEL, SEARCH_EVERY, type Progress, type Stats } from '../meta/progress'
import type { Settings } from '../meta/settings'
import type { SleepMinutes } from '../ui/sleep-timer'
import { Board } from './board'
import { Quiz } from './quiz'
import { WordSearch } from './wordsearch'

interface Props {
  progress: Progress
  settings: Settings
  sleepMinutes: SleepMinutes
  onProgress: (update: (p: Progress) => Progress) => void
  onSettings: (patch: Partial<Settings>) => void
  onSleep: (minutes: SleepMinutes) => void
  onHome: () => void
}

export function Journey({ progress, onProgress, ...common }: Props) {
  const [loaded, setLoaded] = useState<LoadedLevel | 'end' | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoaded(null)
    loadLevel(progress.level).then((l) => {
      if (cancelled) return
      if (!l) return setLoaded('end')
      if (progress.current?.levelId !== l.level.id) onProgress((p) => ({ ...p, current: emptyProgress(l.level.id) }))
      setLoaded(l)
    })
    return () => {
      cancelled = true
    }
  }, [progress.level])

  const brk = progress.pendingBreak
  if (brk) {
    const finishBreak = (coins: number, asked = 0) =>
      onProgress((p) => ({ ...p, coins: p.coins + coins, pendingBreak: null, quizNext: p.quizNext + asked }))
    return brk.kind === 'quiz' ? (
      <Quiz start={progress.quizNext} onDone={finishBreak} />
    ) : (
      <WordSearch seed={brk.after} breakNumber={Math.floor(brk.after / SEARCH_EVERY)} onDone={(c) => finishBreak(c)} />
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

  const lp = progress.current
  if (!loaded || !lp || lp.levelId !== loaded.level.id) return <main class="play" aria-busy="true" />
  const { level, pack, isLastInPack } = loaded

  const commit = (next: LevelProgress, coins: number, stats: Partial<Stats>) =>
    onProgress((p) => ({ ...p, current: next, coins: p.coins + coins, stats: addStats(p.stats, stats) }))

  const nextLevel = (skipped: boolean) =>
    onProgress((p) => ({
      ...p,
      level: p.level + 1,
      current: null,
      pendingBreak: breakAfter(p.level),
      stats: addStats(p.stats, { skipped: skipped ? 1 : 0 }),
    }))

  return (
    <Board
      key={level.id}
      {...common}
      level={level}
      title={pack.name}
      subtitle={`Level ${level.id}`}
      lp={lp}
      coins={progress.coins}
      completionCoins={COINS_PER_LEVEL}
      finishedNote={isLastInPack ? `You've finished ${pack.name} · a new postcard` : pack.name}
      onCommit={commit}
      onSkip={() => nextLevel(true)}
      onContinue={() => nextLevel(false)}
    />
  )
}
