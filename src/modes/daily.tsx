// The daily puzzle: a slightly bigger wheel, a butterfly on one word, and a pressed flower
// for the Postcards collection. No streaks; missing a day changes nothing.
import { useEffect, useState } from 'preact/hooks'
import { butterflyWord, formatDay, loadDaily, todayKey } from '../game/daily'
import type { Level } from '../game/level'
import { emptyProgress, type LevelProgress } from '../game/level-state'
import { addStats, COINS_BUTTERFLY, COINS_PER_DAILY, type Progress, type Stats } from '../meta/progress'
import type { Settings } from '../meta/settings'
import type { SleepMinutes } from '../ui/sleep-timer'
import { Board } from './board'

interface Props {
  progress: Progress
  settings: Settings
  sleepMinutes: SleepMinutes
  onProgress: (update: (p: Progress) => Progress) => void
  onSettings: (patch: Partial<Settings>) => void
  onSleep: (minutes: SleepMinutes) => void
  onHome: () => void
}

export function Daily({ progress, onProgress, ...common }: Props) {
  const [today] = useState(todayKey)
  const [level, setLevel] = useState<Level>()

  useEffect(() => {
    loadDaily(today).then((l) => {
      if (progress.daily?.date !== today || progress.daily.current.levelId !== l.id) {
        onProgress((p) => ({ ...p, daily: { date: today, current: emptyProgress(l.id) } }))
      }
      setLevel(l)
    })
  }, [today])

  const lp = progress.daily?.date === today ? progress.daily.current : undefined
  if (!level || !lp || lp.levelId !== level.id) return <main class="play" aria-busy="true" />

  const commit = (next: LevelProgress, coins: number, stats: Partial<Stats>) =>
    onProgress((p) => ({
      ...p,
      daily: { date: today, current: next },
      coins: p.coins + coins,
      // Finishing presses a flower for today (once, however many times it's reopened).
      flowers: stats.levelsDone && !p.flowers.includes(today) ? [...p.flowers, today] : p.flowers,
      stats: addStats(p.stats, { ...stats, levelsDone: 0 }),
    }))

  return (
    <Board
      key={level.id}
      {...common}
      level={level}
      title="Daily puzzle"
      subtitle={formatDay(today)}
      lp={lp}
      coins={progress.coins}
      completionCoins={COINS_PER_DAILY}
      butterfly={{ word: butterflyWord(level), coins: COINS_BUTTERFLY }}
      finishedNote="A pressed flower for your collection"
      onCommit={commit}
      onContinue={common.onHome}
    />
  )
}
