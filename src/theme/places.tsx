// Paintings for single places, so each one shows what its name says: clover on Clover Hill,
// a gate on Hayfield Gate. Everything sits below the open sky; far things are small and
// near things large. Night colours keep their blue at 00, like the palettes.
import type { JSX } from 'preact'
import { H, heightAt, surface, W, type Palette, type Ridge } from './paint-kit'

export interface PaintContext {
  p: Palette
  r: () => number
  night: boolean
  add: (el: JSX.Element) => void
  layer: (color: string, baseY: number, amplitude: number, jagged?: boolean) => Ridge
}

type Painter = (c: PaintContext) => void

const n = (v: number) => Math.round(v * 10) / 10
const at = (x: number, y: number, s: number) => `translate(${n(x)},${n(y)}) scale(${n(s * 100) / 100})`

// Day colour, then its night colour.
const COLORS = {
  leaf: ['#4f7a46', '#5a2a00'],
  leafLight: ['#6f9c5d', '#7a3c00'],
  stem: ['#5d8250', '#4a2200'],
  yellow: ['#f0c53a', '#d89a00'],
  gold: ['#e8ac2a', '#e0a000'],
  white: ['#f8f4e8', '#c89000'],
  cream: ['#efe6cc', '#a87000'],
  pink: ['#e59ab0', '#c06800'],
  cloverPink: ['#e4b9c4', '#b86a00'],
  red: ['#d14a30', '#b04000'],
  dark: ['#3d2c24', '#2a1200'],
  violet: ['#8f7cc4', '#9a5000'],
  bluebell: ['#7c86c9', '#a05800'],
  hay: ['#e4c47c', '#a86a00'],
  hayShade: ['#c7a259', '#7a4800'],
  wood: ['#8b6b4c', '#4a2400'],
  woodDark: ['#6b5039', '#341800'],
  path: ['#ddcca6', '#4a2600'],
  water: ['#a8c8cd', '#3a1c00'],
  ripple: ['#e1ece8', '#7a4200'],
  straw: ['#d7b26a', '#9a6000'],
  bee: ['#e9b23a', '#c88200'],
  wing: ['#ffffff', '#6a3a00'],
} as const

type Color = keyof typeof COLORS
const colors = (night: boolean) => (name: Color) => COLORS[name][night ? 1 : 0]

// Near things are bigger: 0.3 at the horizon, 1 two-thirds down, more at the bottom edge.
const depth = (y: number) => Math.max(0.3, (y - 380) / 260)

// Scatter things over a ground shape, between its surface and `below` units under it,
// drawn far to near so the near ones overlap.
function scatter(r: () => number, count: number, ground: Ridge, below: number, draw: (x: number, y: number, s: number) => JSX.Element, from = 0, to = W) {
  const spots: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const x = from + r() * (to - from)
    const top = heightAt(ground, x)
    spots.push([x, top + 3 + r() * Math.max(0, Math.min(H, top + below) - top - 3)])
  }
  return spots.sort((a, b) => a[1] - b[1]).map(([x, y]) => draw(x, y, depth(y)))
}

// --- Flowers and things ----------------------------------------------------------------

const clover = (x: number, y: number, s: number, fill: string) => (
  <g transform={at(x, y, s)} fill={fill}>
    <circle cx={0} cy={-3} r={3.1} />
    <circle cx={-2.8} cy={1.6} r={3.1} />
    <circle cx={2.8} cy={1.6} r={3.1} />
  </g>
)

const cloverHead = (x: number, y: number, s: number, head: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-6 0,-11" stroke={stem} stroke-width={1} fill="none" />
    <circle cx={0} cy={-13} r={3.4} fill={head} />
  </g>
)

const dandelion = (x: number, y: number, s: number, head: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q-1,-8 0,-15" stroke={stem} stroke-width={1.1} fill="none" />
    <circle cx={0} cy={-18} r={5.4} fill="none" stroke={head} stroke-width={2.2} stroke-dasharray="1.2 0.9" />
    <circle cx={0} cy={-18} r={4} fill={head} />
  </g>
)

const puff = (x: number, y: number, s: number, seed: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-9 0,-18" stroke={stem} stroke-width={1} fill="none" />
    <circle cx={0} cy={-24} r={6.5} fill={seed} opacity={0.35} />
    <circle cx={0} cy={-24} r={6.5} fill="none" stroke={seed} stroke-width={1.6} stroke-dasharray="0.5 1.1" opacity={0.9} />
    <circle cx={0} cy={-24} r={1.2} fill={stem} />
  </g>
)

// A single dandelion seed drifting on the air.
const seedling = (x: number, y: number, s: number, tilt: number, fill: string) => (
  <g transform={`${at(x, y, s)} rotate(${n(tilt)})`} stroke={fill} stroke-width={0.6} fill="none" opacity={0.85}>
    <path d="M0,0 L0,5" />
    <path d="M0,0 L-2.5,-2 M0,0 L-1,-3 M0,0 L1,-3 M0,0 L2.5,-2" />
  </g>
)

const daisy = (x: number, y: number, s: number, petal: string, centre: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-5 0,-9" stroke={stem} stroke-width={1} fill="none" />
    <g transform="translate(0,-12)" fill={petal}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse cx={0} cy={-3.4} rx={1.3} ry={3} transform={`rotate(${a})`} />
      ))}
      <circle r={1.7} fill={centre} />
    </g>
  </g>
)

const poppy = (x: number, y: number, s: number, petal: string, centre: string, stem: string, open: boolean) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q-2,-9 0,-18" stroke={stem} stroke-width={1.1} fill="none" />
    {open ? (
      <g transform="translate(0,-21)">
        <circle cx={-2} cy={-1} r={3.8} fill={petal} />
        <circle cx={2} cy={-1} r={3.8} fill={petal} />
        <circle cx={0} cy={1.4} r={3.8} fill={petal} />
        <circle cx={0} cy={-0.2} r={1.4} fill={centre} />
      </g>
    ) : (
      <ellipse cx={0.5} cy={-20} rx={1.8} ry={2.8} fill={stem} />
    )}
  </g>
)

const buttercup = (x: number, y: number, s: number, petal: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-5 0,-10" stroke={stem} stroke-width={0.9} fill="none" />
    <g transform="translate(0,-12)" fill={petal}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle cx={0} cy={-1.9} r={1.8} transform={`rotate(${a})`} />
      ))}
    </g>
  </g>
)

const bluebell = (x: number, y: number, s: number, bell: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q0,-14 6,-18" stroke={stem} stroke-width={1} fill="none" />
    {[
      [1.2, -11],
      [2.6, -14.5],
      [4.4, -16.6],
      [6.2, -17.4],
    ].map(([bx, by]) => (
      <ellipse cx={bx + 1} cy={by + 2.4} rx={1.4} ry={2.3} fill={bell} />
    ))}
  </g>
)

const bloom = (x: number, y: number, s: number, petal: string, stem: string, tall: number) => (
  <g transform={at(x, y, s)}>
    <path d={`M0,0 Q1,${-tall / 2} 0,${-tall}`} stroke={stem} stroke-width={0.9} fill="none" />
    <circle cx={0} cy={-tall - 2} r={2.4} fill={petal} />
  </g>
)

const grass = (x: number, y: number, s: number, color: string, lean: number, tall: number) => (
  <path transform={at(x, y, s)} d={`M0,0 Q${n(lean * 0.3)},${n(-tall * 0.6)} ${n(lean)},${n(-tall)}`} stroke={color} stroke-width={1.3} fill="none" stroke-linecap="round" />
)

const lark = (x: number, y: number, s: number, color: string) => (
  <path transform={at(x, y, s)} d="M-7,0 Q-3.5,-4 0,0.5 Q3.5,-4 7,0" stroke={color} stroke-width={1.4} fill="none" stroke-linecap="round" />
)

const bee = (x: number, y: number, s: number, body: string, wing: string, stripe: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={-1} cy={-2.6} rx={1.8} ry={1.4} fill={wing} opacity={0.75} />
    <ellipse cx={1.4} cy={-2.4} rx={1.6} ry={1.2} fill={wing} opacity={0.6} />
    <ellipse cx={0} cy={0} rx={2.8} ry={1.9} fill={body} />
    <path d="M-0.6,-1.8 L-0.6,1.8 M1.2,-1.6 L1.2,1.6" stroke={stripe} stroke-width={0.7} />
  </g>
)

// A straw beehive: stacked coils narrowing to a dome, with a little dark doorway.
const skep = (x: number, y: number, s: number, straw: string, shade: string, door: string) => (
  <g transform={at(x, y, s)}>
    {[
      [0, 13],
      [-5, 12.4],
      [-10, 11],
      [-15, 8.6],
      [-19, 5],
    ].map(([cy, rx]) => (
      <ellipse cx={0} cy={cy - 2} rx={rx} ry={3.6} fill={straw} stroke={shade} stroke-width={0.8} />
    ))}
    <path d="M-3,1.5 Q0,-4 3,1.5 Z" fill={door} />
  </g>
)

const roundTree = (x: number, y: number, s: number, crown: string, trunk: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-2.5} y={-22} width={5} height={22} fill={trunk} />
    <circle cx={0} cy={-34} r={16} fill={crown} />
    <circle cx={-12} cy={-25} r={11} fill={crown} />
    <circle cx={12} cy={-26} r={12} fill={crown} />
  </g>
)

// A weeping willow: a soft crown with long strands hanging almost to the ground.
function willow(r: () => number, x: number, y: number, s: number, crown: string, strand: string, trunk: string) {
  const strands: JSX.Element[] = []
  for (let i = 0; i < 90; i++) {
    const a = Math.PI * r()
    const sx = -Math.cos(a) * 62
    const sy = -100 - Math.sin(a) * 34
    const len = 70 + r() * 30 - Math.abs(sx) * 0.4
    strands.push(<path d={`M${n(sx)},${n(sy)} q${n(sx * 0.15)},${n(len * 0.5)} ${n(sx * 0.25)},${n(len)}`} stroke={i % 3 ? strand : crown} stroke-width={2.4} fill="none" stroke-linecap="round" />)
  }
  return (
    <g transform={at(x, y, s)}>
      <path d="M-6,0 Q-3,-40 -8,-96 L2,-96 Q3,-50 7,0 Z" fill={trunk} />
      <ellipse cx={-26} cy={-104} rx={36} ry={26} fill={crown} />
      <ellipse cx={24} cy={-106} rx={38} ry={28} fill={crown} />
      <ellipse cx={0} cy={-122} rx={40} ry={26} fill={crown} />
      {strands}
    </g>
  )
}

// A wooden five-bar gate between two posts, with its diagonal brace.
const gate = (x: number, y: number, s: number, wood: string, dark: string) => (
  <g transform={at(x, y, s)} stroke-linecap="round">
    <rect x={-4} y={-58} width={9} height={62} fill={dark} />
    <rect x={112} y={-58} width={9} height={62} fill={dark} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect x={5} y={-50 + i * 11} width={102} height={4.4} fill={wood} />
    ))}
    <rect x={5} y={-50} width={6} height={48} fill={wood} />
    <rect x={101} y={-50} width={6} height={48} fill={wood} />
    <path d="M10,-4 L103,-48" stroke={wood} stroke-width={4.4} />
  </g>
)

const bale = (x: number, y: number, s: number, hay: string, shade: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-13} y={-22} width={26} height={22} rx={3} fill={shade} />
    <ellipse cx={13} cy={-11} rx={7} ry={11} fill={hay} />
    <ellipse cx={13} cy={-11} rx={3.6} ry={6} fill="none" stroke={shade} stroke-width={1} />
    <path d="M-13,-15 L13,-15 M-13,-8 L13,-8" stroke={hay} stroke-width={0.8} opacity={0.6} />
  </g>
)

// A ribbon that winds from a point on the horizon (t=0) to the bottom edge (t=1): a lane or a brook.
function ribbon(far: [number, number], nearX: number, wiggle: number, nearWidth: number) {
  const mid = (t: number) => {
    const y = far[1] + (H + 20 - far[1]) * t ** 1.25
    const x = far[0] + (nearX - far[0]) * t + Math.sin(t * Math.PI * 1.6) * wiggle * t
    return { x, y, w: 3 + nearWidth * t ** 1.6 }
  }
  const pts = Array.from({ length: 41 }, (_, i) => mid(i / 40))
  const left = pts.map((q) => `${n(q.x - q.w / 2)},${n(q.y)}`)
  const right = pts.map((q) => `${n(q.x + q.w / 2)},${n(q.y)}`).reverse()
  return { d: `M${left.join(' L')} L${right.join(' L')} Z`, mid }
}

// --- The Meadow -------------------------------------------------------------------------

const cloverHill: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 28)
  layer(p.layers[1], 490, 18)
  const peak = 140 + r() * 120
  const hill = surface((x) => 560 - 170 * Math.exp(-(((x - peak) / 150) ** 2)) + Math.sin(x / 37) * 3)
  add(<path d={hill.d} fill={p.layers[2]} />)
  scatter(r, 420, hill, 420, (x, y, s) => clover(x, y, s * 0.9, r() < 0.55 ? c('leaf') : c('leafLight'))).forEach(add)
  scatter(r, 60, hill, 420, (x, y, s) => cloverHead(x, y, s, r() < 0.6 ? c('white') : c('cloverPink'), c('stem'))).forEach(add)
  const near = layer(p.layers[3], 725, 14)
  scatter(r, 110, near, 90, (x, y, s) => clover(x, y, s, r() < 0.5 ? c('leaf') : c('leafLight'))).forEach(add)
  scatter(r, 16, near, 80, (x, y, s) => cloverHead(x, y, s, r() < 0.6 ? c('white') : c('cloverPink'), c('stem'))).forEach(add)
}

const dandelionField: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 440, 24)
  layer(p.layers[1], 478, 10)
  const field = surface((x) => 505 + Math.sin(x / 60 + r()) * 5)
  add(<path d={field.d} fill={p.layers[2]} />)
  scatter(r, 170, field, 300, (x, y, s) => (r() < 0.72 ? dandelion(x, y, s, c('yellow'), c('stem')) : puff(x, y, s, c('white'), c('stem')))).forEach(add)
  const near = layer(p.layers[3], 735, 10)
  scatter(r, 22, near, 70, (x, y, s) => (r() < 0.6 ? dandelion(x, y, s, c('yellow'), c('stem')) : puff(x, y, s, c('white'), c('stem')))).forEach(add)
  for (let i = 0; i < 26; i++) add(seedling(r() * W, 300 + r() * 220, 0.8 + r() * 0.9, -30 + r() * 60, c('white')))
}

const honeybeeLane: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 26)
  layer(p.layers[1], 500, 12)
  const vx = 170 + r() * 60
  const lane = ribbon([vx, 503], 210, 70, 190)
  add(<path d={lane.d} fill={c('path')} />)
  // Hedgerows along both sides, with flowers tucked in.
  for (const side of [-1, 1]) {
    for (let i = 4; i <= 80; i++) {
      const q = lane.mid(i / 80)
      const s = depth(q.y)
      const hx = q.x + side * (q.w / 2 + 22 * s) + (r() - 0.5) * 6 * s
      add(<ellipse cx={n(hx)} cy={n(q.y - 12 * s)} rx={n((16 + r() * 6) * s)} ry={n((14 + r() * 6) * s)} fill={r() < 0.5 ? p.layers[2] : p.layers[3]} />)
      if (r() < 0.7) add(bloom(hx + (r() - 0.5) * 24 * s, q.y - (6 + r() * 14) * s, s * 0.8, r() < 0.5 ? c('pink') : c('white'), c('stem'), 4))
    }
  }
  // Two straw skeps on a little bench beside the lane.
  const side = vx < 200 ? 1 : -1
  const q = lane.mid(0.55)
  const bx = q.x + side * (q.w / 2 + 70)
  const s = depth(q.y)
  add(<rect x={n(bx - 32 * s)} y={n(q.y - 4 * s)} width={n(64 * s)} height={n(4 * s)} fill={c('woodDark')} />)
  add(<rect x={n(bx - 28 * s)} y={n(q.y)} width={n(4 * s)} height={n(12 * s)} fill={c('woodDark')} />)
  add(<rect x={n(bx + 24 * s)} y={n(q.y)} width={n(4 * s)} height={n(12 * s)} fill={c('woodDark')} />)
  add(skep(bx - 15 * s, q.y - 4 * s, s * 0.9, c('straw'), c('hayShade'), c('dark')))
  add(skep(bx + 15 * s, q.y - 4 * s, s * 0.9, c('straw'), c('hayShade'), c('dark')))
  for (let i = 0; i < 9; i++) add(bee(bx - 60 + r() * 140, q.y - 50 - r() * 90, 1.2 + r() * 0.6, c('bee'), c('wing'), c('dark')))
}

const wildflowerRise: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const mix: Color[] = ['violet', 'pink', 'yellow', 'white', 'red', 'bluebell']
  layer(p.layers[0], 448, 24)
  layer(p.layers[1], 520, 14)
  const flip = r() < 0.5
  const rise = surface((x) => 620 - 190 * ((flip ? W - x : x) / W) ** 1.4 + Math.sin(x / 41) * 4)
  add(<path d={rise.d} fill={p.layers[2]} />)
  scatter(r, 160, rise, 400, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 10 + r() * 8)).forEach(add)
  scatter(r, 380, rise, 400, (x, y, s) => (r() < 0.2 ? daisy(x, y, s * 0.8, c('white'), c('yellow'), c('stem')) : bloom(x, y, s, c(mix[Math.floor(r() * mix.length)]), c('stem'), 6 + r() * 10))).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 30, near, 50, (x, y, s) => bloom(x, y, s, c(mix[Math.floor(r() * mix.length)]), c('stem'), 10 + r() * 10)).forEach(add)
}

const buttercupVale: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 450, 20)
  const vx = 150 + r() * 100
  const left = surface((x) => 420 + 150 * Math.min(1, Math.max(0, x / (vx + 60))) ** 1.6 + Math.sin(x / 30) * 3)
  add(<path d={left.d} fill={p.layers[1]} />)
  const right = surface((x) => 430 + 150 * Math.min(1, Math.max(0, (W - x) / (W - vx + 60))) ** 1.6 + Math.sin(x / 34) * 3)
  add(<path d={right.d} fill={p.layers[2]} />)
  scatter(r, 90, left, 120, (x, y, s) => buttercup(x, y, s * 0.8, c('yellow'), c('stem')), 0, vx).forEach(add)
  scatter(r, 90, right, 120, (x, y, s) => buttercup(x, y, s * 0.8, c('yellow'), c('stem')), vx, W).forEach(add)
  const floor = surface((x) => 585 + Math.sin(x / 50) * 4)
  add(<path d={floor.d} fill={p.layers[3]} />)
  scatter(r, 420, floor, 230, (x, y, s) => buttercup(x, y, s, r() < 0.85 ? c('yellow') : c('gold'), c('stem'))).forEach(add)
}

const larkMeadow: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 450, 22)
  layer(p.layers[1], 525, 16)
  const mid = layer(p.layers[2], 610, 14)
  scatter(r, 120, mid, 100, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 8, 14 + r() * 10)).forEach(add)
  const near = layer(p.layers[3], 700, 12)
  scatter(r, 170, near, 110, (x, y, s) => grass(x, y, s, r() < 0.5 ? p.layers[2] : p.layers[1], (r() - 0.5) * 12, 18 + r() * 22)).forEach(add)
  scatter(r, 26, near, 100, (x, y, s) => bloom(x, y, s * 0.8, r() < 0.5 ? c('white') : c('yellow'), c('stem'), 24 + r() * 14)).forEach(add)
  // Larks high over the meadow, one close and singing.
  const ink = c('dark')
  for (let i = 0; i < 6; i++) add(lark(40 + r() * 320, 300 + r() * 130, 1.2 + r() * 0.8, ink))
  add(lark(120 + r() * 160, 420 + r() * 30, 3, ink))
}

const poppyBank: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 440, 24)
  layer(p.layers[1], 500, 14)
  const flip = r() < 0.5
  const bank = surface((x) => 480 + 170 * ((flip ? W - x : x) / W) ** 1.3 + Math.sin(x / 28) * 3)
  add(<path d={bank.d} fill={p.layers[2]} />)
  scatter(r, 120, bank, 400, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 10 + r() * 10)).forEach(add)
  scatter(r, 300, bank, 400, (x, y, s) => poppy(x, y, s, c('red'), c('dark'), c('stem'), r() < 0.85)).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 24, near, 50, (x, y, s) => poppy(x, y, s, c('red'), c('dark'), c('stem'), r() < 0.8)).forEach(add)
}

const daisyHollow: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const rim = surface((x) => 470 + 70 * Math.sin((Math.PI * x) / W) + Math.sin(x / 33) * 3)
  add(<path d={rim.d} fill={p.layers[1]} />)
  // Trees around the rim shelter the hollow.
  for (const tx of [30 + r() * 40, 330 + r() * 40]) add(roundTree(tx, heightAt(rim, tx) + 4, 1.2, p.layers[3], c('woodDark')))
  const bowl = surface((x) => 500 + 120 * Math.sin((Math.PI * x) / W) + Math.sin(x / 29) * 3)
  add(<path d={bowl.d} fill={p.layers[2]} />)
  scatter(r, 380, bowl, 330, (x, y, s) => daisy(x, y, s, c('white'), c('yellow'), c('stem'))).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 24, near, 50, (x, y, s) => daisy(x, y, s, c('white'), c('yellow'), c('stem'))).forEach(add)
}

const hayfieldGate: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 24)
  layer(p.layers[2], 495, 8) // the far hedge
  const field = surface((x) => 505 + Math.sin(x / 70) * 3)
  add(<path d={field.d} fill={c('hay')} />)
  // Rows left by the mower, closer together far away.
  for (let i = 1; i < 10; i++) {
    const y = 505 + 200 * (i / 10) ** 1.6
    add(<path d={`M0,${n(y)} Q200,${n(y - 6)} ${W},${n(y + 2)}`} stroke={c('hayShade')} stroke-width={n(0.6 + i * 0.25)} fill="none" opacity={0.7} />)
  }
  const bales: [number, number][] = Array.from({ length: 5 }, () => [30 + r() * 340, 530 + r() * 110])
  bales.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => add(bale(x, y, depth(y) * 2.2, c('hay'), c('hayShade'))))
  const near = layer(p.layers[3], 708, 8)
  scatter(r, 110, near, 90, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 10, 14 + r() * 14)).forEach(add)
  const gx = 50 + r() * 90
  add(gate(gx, heightAt(near, gx + 55) + 6, 2, c('wood'), c('woodDark')))
}

const bluebellGreen: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 440, 22)
  const wood = surface((x) => 500 + Math.sin(x / 45) * 4)
  add(<path d={wood.d} fill={p.layers[1]} />)
  for (let x = -10; x < W + 20; x += 26 + r() * 18) add(roundTree(x, heightAt(wood, Math.max(0, Math.min(W, x))) + 6, 0.9 + r() * 0.5, r() < 0.5 ? p.layers[2] : p.layers[3], c('woodDark')))
  const green = surface((x) => 520 + Math.sin(x / 52) * 5)
  add(<path d={green.d} fill={p.layers[2]} />)
  // A haze of bluebells under the trees, then single flowers coming closer.
  for (let i = 0; i < 40; i++) add(<ellipse cx={n(r() * W)} cy={n(526 + r() * 30)} rx={n(10 + r() * 22)} ry={n(2 + r() * 3)} fill={c('bluebell')} opacity={0.35} />)
  scatter(r, 240, green, 50, (x, y, s) => bluebell(x, y, s, r() < 0.8 ? c('bluebell') : c('violet'), c('stem'))).forEach(add)
  scatter(r, 220, green, 280, (x, y, s) => bluebell(x, y, s, r() < 0.8 ? c('bluebell') : c('violet'), c('stem'))).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 22, near, 50, (x, y, s) => bluebell(x, y, s, c('bluebell'), c('stem'))).forEach(add)
}

const willowBrook: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 24)
  const bank = layer(p.layers[1], 505, 10)
  const ground = surface((x) => heightAt(bank, x) + 6)
  add(<path d={ground.d} fill={p.layers[2]} />)
  const fx = 160 + r() * 80
  const brook = ribbon([fx, 508], fx < 200 ? 250 : 150, 60, 230)
  add(<path d={brook.d} fill={c('water')} />)
  for (let i = 4; i < 40; i += 2) {
    const q = brook.mid(i / 40)
    add(<path d={`M${n(q.x - q.w * 0.25)},${n(q.y)} q${n(q.w * 0.12)},-2 ${n(q.w * 0.25)},0`} stroke={c('ripple')} stroke-width={n(0.6 + depth(q.y) * 0.8)} fill="none" opacity={0.7} />)
  }
  // Reeds and bulrushes along both edges.
  for (const side of [-1, 1]) {
    for (let i = 6; i <= 40; i += 2) {
      const q = brook.mid(i / 40)
      const s = depth(q.y)
      const x = q.x + side * (q.w / 2 + 2 * s)
      add(grass(x, q.y, s, p.layers[3], side * (2 + r() * 4), 16 + r() * 10))
      if (r() < 0.3) add(<rect x={n(x - 1.2 * s)} y={n(q.y - 24 * s)} width={n(2.4 * s)} height={n(7 * s)} rx={n(1.2 * s)} fill={c('woodDark')} />)
    }
  }
  const wx = fx < 200 ? 100 + r() * 20 : 280 + r() * 20
  add(willow(r, wx, 690, 1.45, p.layers[3], p.layers[2], c('woodDark')))
}

export const PLACES: Record<string, Painter> = {
  'Clover Hill': cloverHill,
  'Dandelion Field': dandelionField,
  'Honeybee Lane': honeybeeLane,
  'Wildflower Rise': wildflowerRise,
  'Buttercup Vale': buttercupVale,
  'Lark Meadow': larkMeadow,
  'Poppy Bank': poppyBank,
  'Daisy Hollow': daisyHollow,
  'Hayfield Gate': hayfieldGate,
  'Bluebell Green': bluebellGreen,
  'Willow Brook': willowBrook,
}
