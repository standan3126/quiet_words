import { useEffect, useRef, useState } from 'preact/hooks'

interface Props {
  letters: string
  shuffleCount: number // bump to shuffle the letters
  onTrace: (word: string) => void // the word so far, while the finger is down
  onWord: (word: string) => void // finger lifted
}

const SIZE = 300
const CENTER = SIZE / 2
const RING = 96

// Letter wheel: press a letter, slide through others, lift to submit.
// Sliding back onto the previous letter undoes it.
export function Wheel({ letters, shuffleCount, onTrace, onWord }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const n = letters.length
  const nodeR = n <= 5 ? 33 : n <= 7 ? 29 : 26

  // slots[i] = which ring position letter i sits in. Shuffling permutes slots,
  // and the CSS transition glides each letter to its new spot.
  const [slots, setSlots] = useState(() => letters.split('').map((_, i) => i))
  const path = useRef<number[]>([])
  const [trace, setTrace] = useState<number[]>([])
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => setSlots(letters.split('').map((_, i) => i)), [letters])

  useEffect(() => {
    if (!shuffleCount || n < 2) return
    setSlots((current) => {
      let next = current
      while (next.every((s, i) => s === current[i])) next = [...current].sort(() => Math.random() - 0.5)
      return next
    })
  }, [shuffleCount])

  const slotPos = (slot: number) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * slot) / n
    return { x: CENTER + RING * Math.cos(angle), y: CENTER + RING * Math.sin(angle) }
  }
  const letterPos = (i: number) => slotPos(slots[i])

  const toSvg = (e: PointerEvent) => {
    const m = svg.current!.getScreenCTM()!.inverse()
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    return { x: p.x, y: p.y }
  }

  const letterAt = (p: { x: number; y: number }) => {
    for (let i = 0; i < n; i++) {
      const c = letterPos(i)
      if (Math.hypot(c.x - p.x, c.y - p.y) < nodeR * 1.1) return i
    }
    return -1
  }

  const update = (next: number[]) => {
    path.current = next
    setTrace(next)
    onTrace(next.map((i) => letters[i]).join(''))
  }

  const onDown = (e: PointerEvent) => {
    const p = toSvg(e)
    const i = letterAt(p)
    if (i < 0) return
    svg.current!.setPointerCapture(e.pointerId)
    setPointer(p)
    update([i])
  }

  const onMove = (e: PointerEvent) => {
    if (!path.current.length) return
    const p = toSvg(e)
    setPointer(p)
    const i = letterAt(p)
    if (i < 0) return
    const current = path.current
    if (i === current[current.length - 2]) update(current.slice(0, -1))
    else if (!current.includes(i)) update([...current, i])
  }

  const finish = (submit: boolean) => {
    const word = path.current.map((i) => letters[i]).join('')
    setPointer(null)
    update([])
    if (submit && word) onWord(word)
  }

  const points = trace.map(letterPos)
  const line = [...points, ...(pointer && points.length ? [pointer] : [])].map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg
      ref={svg}
      class="wheel"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => finish(true)}
      onPointerCancel={() => finish(false)}
      role="group"
      aria-label={`Letter wheel: ${letters.toUpperCase().split('').join(' ')}`}
    >
      <circle cx={CENTER} cy={CENTER} r={CENTER - 4} class="wheel-bg" />
      {line && <polyline points={line} class="wheel-trace" />}
      {letters.split('').map((letter, i) => {
        const { x, y } = letterPos(i)
        const active = trace.includes(i)
        return (
          <g key={i} class={`wheel-letter${active ? ' active' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }} data-letter={letter} data-index={i}>
            <circle r={nodeR} />
            <text dy="0.36em" style={{ fontSize: `${nodeR * 1.15}px` }}>
              {letter.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
