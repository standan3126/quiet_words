import { useEffect, useState } from 'preact/hooks'
import type { PackSummary } from '../game/level'
import { loadIndex } from '../game/levels'
import type { Progress } from '../meta/progress'
import { PaintedScene } from '../theme/painted'

interface Props {
  progress: Progress
  theme: 'day' | 'night'
  onJourney: () => void // back to the level reached, leaving a revisit behind
  onRevisit: (pack: PackSummary) => void
}

// Levels (the launch page's Levels button): a postcard for every place finished. Nothing to
// tend, nothing to roll for: it simply fills in as you play. Tapping a postcard plays that
// place's levels again. Home (top left) comes from the toolbox frame.
export function Postcards({ progress, theme, onJourney, onRevisit }: Props) {
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
        <h2>Levels</h2>
      </header>
      {progress.revisit && (
        <button class="primary-button" onClick={onJourney}>
          Back to your journey · Level {progress.level}
        </button>
      )}

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

    </main>
  )
}
