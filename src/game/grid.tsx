import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { ButterflyIcon } from '../ui/icons'
import type { Level } from './level'
import { allCells, wordCells, type LevelProgress } from './level-state'

export interface Flash {
  word: string
  kind: 'new' | 'repeat'
  id: number // changes on every flash so the animation restarts
}

interface Props {
  level: Level
  progress: LevelProgress
  flash: Flash | null
  targeting: boolean // bullseye: hidden cells become tappable
  butterflyCell?: string // daily puzzle: marks the first square of the butterfly's word
  onCellTap: (key: string) => void
}

const MAX_CELL = 58
const GAP = 4

export function Grid({ level, progress, flash, targeting, butterflyCell, onCellTap }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState(40)
  const cells = useMemo(() => allCells(level), [level])

  // Largest square size that fits the space available.
  useLayoutEffect(() => {
    const el = box.current!
    const fit = () => {
      const size = Math.floor(Math.min(el.clientWidth / level.width, el.clientHeight / level.height, MAX_CELL))
      setCell(Math.max(16, size))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [level])

  const foundCells = useMemo(() => {
    const set = new Set<string>()
    for (const p of level.words) if (progress.found.includes(p.word)) wordCells(p).forEach((k) => set.add(k))
    return set
  }, [level, progress.found])
  const revealed = new Set(progress.revealed)
  const challengeCells = useMemo(() => new Set(level.words.filter((p) => p.challenge).flatMap(wordCells)), [level])

  // Order of the flashed word's cells, so letters settle in one after another.
  const flashOrder = useMemo(() => {
    const p = flash && level.words.find((w) => w.word === flash.word)
    return new Map(p ? wordCells(p).map((k, i) => [k, i]) : [])
  }, [flash, level])

  return (
    <div class="grid-box" ref={box}>
      <div class={`grid${targeting ? ' targeting' : ''}`} style={{ width: `${cell * level.width}px`, height: `${cell * level.height}px` }}>
        {[...cells].map(([key, c]) => {
          const found = foundCells.has(key)
          const shown = found || revealed.has(key)
          const order = flashOrder.get(key)
          const flashing = order !== undefined
          const state = found ? 'found' : shown ? 'revealed' : 'hidden'
          return (
            <button
              key={flashing ? `${key}-${flash!.id}` : key}
              class={`cell ${state}${challengeCells.has(key) ? ' challenge' : ''}${flashing ? ` flash-${flash!.kind}` : ''}`}
              style={{
                left: `${c.x * cell}px`,
                top: `${c.y * cell}px`,
                width: `${cell - GAP}px`,
                height: `${cell - GAP}px`,
                fontSize: `${cell * 0.55}px`,
                animationDelay: flashing ? `calc(${order! * 70}ms * var(--anim-scale))` : undefined,
              }}
              tabIndex={targeting && !shown ? 0 : -1}
              aria-label={shown ? c.letter.toUpperCase() : 'empty square'}
              data-cell={key}
              onClick={() => onCellTap(key)}
            >
              {shown ? c.letter.toUpperCase() : ''}
              {key === butterflyCell && (
                <span class="butterfly" aria-label="butterfly">
                  <ButterflyIcon size={Math.round(cell * 0.42)} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
