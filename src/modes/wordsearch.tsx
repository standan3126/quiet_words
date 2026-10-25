// A themed word search break, traced with the same swipe as the wheel. Untimed.
import { useMemo, useRef, useState } from 'preact/hooks'
import { audio } from '../audio/engine'
import { COINS_SEARCH_DONE, COINS_SEARCH_WORD } from '../meta/progress'
import { CoinIcon } from '../ui/icons'
import { lineCells, makeSearch, SIZE } from './wordsearch-gen'

interface Props {
  seed: number
  breakNumber: number
  onDone: (coins: number) => void
}

const key = ([x, y]: [number, number]) => `${x},${y}`

export function WordSearch({ seed, breakNumber, onDone }: Props) {
  const search = useMemo(() => makeSearch(seed, breakNumber), [seed, breakNumber])
  const grid = useRef<HTMLDivElement>(null)
  const start = useRef<[number, number] | null>(null)
  const [selection, setSelection] = useState<[number, number][]>([])
  const [found, setFound] = useState<string[]>([])
  const done = found.length === search.words.length
  const earned = found.length * COINS_SEARCH_WORD + (done ? COINS_SEARCH_DONE : 0)

  const foundCells = useMemo(() => {
    const cells = new Set<string>()
    for (const w of search.words) if (found.includes(w.word)) w.cells.forEach((c) => cells.add(key(c)))
    return cells
  }, [found, search])
  const selected = new Set(selection.map(key))

  const cellAt = (e: PointerEvent): [number, number] => {
    const r = grid.current!.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * SIZE)
    const y = Math.floor(((e.clientY - r.top) / r.height) * SIZE)
    return [Math.max(0, Math.min(SIZE - 1, x)), Math.max(0, Math.min(SIZE - 1, y))]
  }

  const onDown = (e: PointerEvent) => {
    if (done) return
    grid.current!.setPointerCapture(e.pointerId)
    start.current = cellAt(e)
    setSelection([start.current])
    audio.letter(0)
  }

  const onMove = (e: PointerEvent) => {
    if (!start.current) return
    const line = lineCells(start.current, cellAt(e))
    if (line.length !== selection.length || key(line[line.length - 1]) !== key(selection[selection.length - 1])) {
      if (line.length > selection.length) audio.letter(line.length - 1)
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
      if (next.length === search.words.length) setTimeout(audio.levelComplete, 500)
      else audio.word()
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
        {search.rows.map((row, y) =>
          [...row].map((ch, x) => {
            const k = `${x},${y}`
            return (
              <span class={`search-cell${foundCells.has(k) ? ' found' : ''}${selected.has(k) ? ' selected' : ''}`} data-cell={k}>
                {ch.toUpperCase()}
              </span>
            )
          }),
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
