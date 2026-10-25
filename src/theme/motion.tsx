// Slow, lazy life over the painted scenes: birds, bumblebees and dandelion fluff by day,
// fireflies at night. Pure CSS animation of transform and opacity, which the browser hands
// to the graphics chip, so it costs little battery. Paths are seeded by location.
import type { JSX } from 'preact'
import { useMemo } from 'preact/hooks'

function rng(seed: number) {
  let a = (seed * 2654435761 + 12345) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Vars = Record<string, string>
const vw = (n: number) => `${n.toFixed(1)}vw`
const vh = (n: number) => `${n.toFixed(1)}vh`
const s = (n: number) => `${n.toFixed(1)}s`

const Bird = () => (
  <svg viewBox="0 0 24 12" class="bird-shape">
    <path class="wing" d="M1,6 Q6,1 12,7 Q18,1 23,6" />
  </svg>
)

const Bee = () => (
  <svg viewBox="0 0 20 16" class="bee-shape">
    <ellipse cx="7" cy="5" rx="4" ry="3" class="bee-wing" />
    <ellipse cx="12" cy="5" rx="4" ry="3" class="bee-wing" />
    <ellipse cx="10" cy="10" rx="6" ry="4.2" fill="#e8b830" />
    <path d="M8,6.2 v7.6 M11.5,6 v8" stroke="#3a2a10" stroke-width="1.6" />
  </svg>
)

const Fluff = () => (
  <svg viewBox="0 0 20 20" class="fluff-shape">
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return <line x1="10" y1="10" x2={10 + Math.cos(a) * 8} y2={10 + Math.sin(a) * 8} />
    })}
    <circle cx="10" cy="10" r="1.4" />
  </svg>
)

function creatures(seed: number, night: boolean): JSX.Element[] {
  const r = rng(seed)
  const out: JSX.Element[] = []
  const add = (cls: string, vars: Vars, child?: JSX.Element) =>
    out.push(
      <div class={`critter ${cls}`} style={vars}>
        <div class="critter-inner">{child}</div>
      </div>,
    )

  if (night) {
    for (let i = 0; i < 14; i++) {
      add('firefly', {
        '--x0': vw(r() * 100), '--y0': vh(20 + r() * 75),
        '--x1': vw(r() * 100), '--y1': vh(20 + r() * 75),
        '--x2': vw(r() * 100), '--y2': vh(20 + r() * 75),
        '--travel': s(45 + r() * 35),
        '--glow': s(3 + r() * 4),
        '--delay': s(-r() * 80),
        '--glow-delay': s(-r() * 7),
      })
    }
    return out
  }

  // Birds cross the sky, then stay away a while before the next pass.
  for (let i = 0; i < 3; i++) {
    const leftward = r() < 0.5
    add('bird', {
      '--from': leftward ? '108vw' : '-8vw', '--to': leftward ? '-8vw' : '108vw',
      '--y0': vh(6 + r() * 25), '--y1': vh(6 + r() * 25),
      '--flip': leftward ? '-1' : '1',
      '--size': `${(14 + r() * 10).toFixed(0)}px`,
      '--travel': s(70 + r() * 40),
      '--flap': s(1.2 + r() * 0.6),
      '--delay': s(-r() * 110),
    }, <Bird />)
  }
  // Bees wander lazily over the lower half of the scene.
  for (let i = 0; i < 3; i++) {
    add('bee', {
      '--x0': vw(5 + r() * 90), '--y0': vh(55 + r() * 35),
      '--x1': vw(5 + r() * 90), '--y1': vh(55 + r() * 35),
      '--x2': vw(5 + r() * 90), '--y2': vh(55 + r() * 35),
      '--travel': s(40 + r() * 25),
      '--bob': s(2.5 + r() * 1.5),
      '--delay': s(-r() * 60),
    }, <Bee />)
  }
  // Dandelion fluff drifts up and across on the breeze, swaying as it goes.
  for (let i = 0; i < 7; i++) {
    add('fluff', {
      '--x0': vw(-10 + r() * 60), '--y0': vh(70 + r() * 30),
      '--x1': vw(50 + r() * 60), '--y1': vh(-10 + r() * 40),
      '--travel': s(55 + r() * 40),
      '--sway': s(5 + r() * 4),
      '--delay': s(-r() * 95),
      '--size': `${(9 + r() * 7).toFixed(0)}px`,
    }, <Fluff />)
  }
  return out
}

export function SceneMotion({ seed, night }: { seed: number; night: boolean }) {
  const items = useMemo(() => creatures(seed, night), [seed, night])
  return (
    <div class="scene-motion" aria-hidden="true">
      {items}
    </div>
  )
}
