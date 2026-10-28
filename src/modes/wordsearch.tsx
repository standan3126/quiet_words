// A themed word search break, traced with the same swipe as the wheel. Untimed.
import { useMemo, useRef, useState } from 'preact/hooks'
import { sound } from '../hub'
import { COINS_SEARCH_DONE, COINS_SEARCH_WORD } from '../meta/progress'
import { CoinIcon } from '../ui/icons'
import { lineCells, makeSearch, SIZE } from './wordsearch-gen'

interface Props {
  seed: number
  breakNumber: number
  onDone: (coins: number) => void
}

const key = ([x, y]: [number, number]) => `${x},${y}`

// A highlighter stroke from the first letter to the last, drawn under the letters.
function Mark({ cells, class: cls }: { cells: [number, number][]; class: string }) {
  const [a, b] = [cells[0], cells[cells.length - 1]]
  return <line class={cls} x1={a[0] + 0.5} y1={a[1] + 0.5} x2={b[0] + 0.5} y2={b[1] + 0.5} />
}

export function WordSearch({ seed, breakNumber, onDone }: Props) {
  const search = useMemo(() => makeSearch(seed, breakNumber), [seed, breakNumber])
  const grid = useRef<HTMLDivElement>(null)
  const start = useRef<[number, number] | null>(null)
  const [selection, setSelection] = useState<[number, number][]>([])
  const [found, setFound] = useState<string[]>([])
  const done = found.length === search.words.length
  const earned = found.length * COINS_SEARCH_WORD + (done ? COINS_SEARCH_DONE : 0)

  const cellAt = (e: PointerEvent): [number, number] => {
    // Measure the letters' area, inside the grid's padding.
    const r = grid.current!.getBoundingClientRect()
    const pad = parseFloat(getComputedStyle(grid.current!).paddingLeft)
    const x = Math.floor(((e.clientX - r.left - pad) / (r.width - 2 * pad)) * SIZE)
    const y = Math.floor(((e.clientY - r.top - pad) / (r.height - 2 * pad)) * SIZE)
    return [Math.max(0, Math.min(SIZE - 1, x)), Math.max(0, Math.min(SIZE - 1, y))]
  }

  const onDown = (e: PointerEvent) => {
    if (done) return
    grid.current!.setPointerCapture(e.pointerId)
    start.current = cellAt(e)
    setSelection([start.current])
    sound.step(0)
  }

  const onMove = (e: PointerEvent) => {
    if (!start.current) return
    const line = lineCells(start.current, cellAt(e))
    if (line.length !== selection.length || key(line[line.length - 1]) !== key(selection[selection.length - 1])) {
      if (line.length > selection.length) sound.step(line.length - 1)
      setSelection(line)
    }
  }

  const onUp = () => {
    if (!start.current) return
    start.current = null
    const text = selection.map(([x, y]) => search.rows[y][x]).join('')
    const reversed = [...text].reverse().join('')
    const hit = search.words.find((w) => !found.includes(w.word) && (w.word === text || w.word === reversed))
    if (hit) {
      const next = [...found, hit.word]
      setFound(next)
      if (next.length === search.words.length) setTimeout(sound.celebrate, 500)
      else sound.chime()
    }
    setSelection([])
  }

  return (
    <main class="play break">
      <header class="break-header">
        <span class="soft">Word search · {search.theme}</span>
        <button class="text-button" onClick={() => onDone(earned)}>
          {done ? 'Continue' : 'Skip'}
        </button>
      </header>

      <div
        class="search-grid panel"
        ref={grid}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="grid"
        aria-label={`Word search: ${search.theme}`}
      >
        <svg class="search-marks" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          {search.words.map((w, i) => found.includes(w.word) && <Mark cells={w.cells} class={`mark-${i % 4}`} />)}
          {selection.length > 0 && <Mark cells={selection} class="mark-live" />}
        </svg>
        {search.rows.map((row, y) =>
          [...row].map((ch, x) => (
            <span class="search-cell" data-cell={`${x},${y}`}>
              {ch.toUpperCase()}
            </span>
          )),
        )}
      </div>

      <ul class="search-words" aria-label="Words to find">
        {search.words.map((w) => (
          <li class={found.includes(w.word) ? 'found' : ''}>{w.word}</li>
        ))}
      </ul>

      {done && (
        <div class="overlay">
          <div class="card panel" role="dialog" aria-label="Word search complete">
            <p class="soft">{search.theme}</p>
            <h2>All found.</h2>
            <p>
              <CoinIcon size={14} /> +{earned}
            </p>
            <button class="primary-button" onClick={() => onDone(earned)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
