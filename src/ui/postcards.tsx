import { useEffect, useState } from 'preact/hooks'
import { formatDay } from '../game/daily'
import type { PackSummary } from '../game/level'
import { loadIndex } from '../game/levels'
import type { Progress } from '../meta/progress'
import { PaintedScene } from '../theme/painted'
import { PressedFlower } from './flower'
import { BackIcon } from './icons'

interface Props {
  progress: Progress
  theme: 'day' | 'night'
  onBack: () => void
  onRevisit: (pack: PackSummary) => void
}

// A postcard for every place finished, and a pressed flower for every daily puzzle.
// Nothing to tend, nothing to roll for: it simply fills in as you play. Tapping a postcard
// plays that place's levels again.
export function Postcards({ progress, theme, onBack, onRevisit }: Props) {
  const [packs, setPacks] = useState<PackSummary[]>([])
  useEffect(() => {
    loadIndex().then((i) => setPacks(i.packs))
  }, [])

  // A place counts as visited once its last level is behind you.
  const visited = (p: PackSummary) => p.firstLevel + p.levelCount <= progress.level
  const journeys = [...new Set(packs.map((p) => p.journey))]
  const count = packs.filter(visited).length

  return (
    <main class="screen postcards">
      <header class="screen-header">
        <button class="icon-button" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <h2>Postcards</h2>
      </header>

      <p class="soft note">
        {count} of {packs.length} places visited{count ? ' · tap a postcard to visit again' : ''}
      </p>
      {journeys.map((journey) => (
        <section class="panel">
          <h3>{journey}</h3>
          <div class="postcard-grid">
            {packs
              .filter((p) => p.journey === journey)
              .map((p) =>
                visited(p) ? (
                  <button class="postcard" onClick={() => onRevisit(p)} aria-label={`Visit ${p.name} again`}>
                    <PaintedScene journey={p.journey} seed={p.id} night={theme === 'night'} place={p.name} />
                    <span class="caption">{p.name}</span>
                  </button>
                ) : (
                  <figure class="postcard locked">
                    <figcaption class="soft">Not yet visited</figcaption>
                  </figure>
                ),
              )}
          </div>
        </section>
      ))}

      <section class="panel">
        <h3>Pressed flowers</h3>
        {progress.flowers.length ? (
          <div class="flower-grid">
            {progress.flowers.map((date) => (
              <figure class="flower">
                <PressedFlower date={date} night={theme === 'night'} />
                <figcaption class="soft">{formatDay(date)}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p class="soft">Finish a daily puzzle to press your first flower.</p>
        )}
      </section>
    </main>
  )
}
