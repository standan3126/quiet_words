// The shared kit for painting single places: colours, perspective, and the flowers, trees
// and other things the paintings are made of. Far things are small and near things large.
// Every night colour keeps its blue at 00, like the palettes.
import type { JSX } from 'preact'
import { H, heightAt, W, type Palette, type Ridge } from '../paint-kit'

export interface PaintContext {
  p: Palette
  r: () => number
  night: boolean
  add: (el: JSX.Element) => void
  layer: (color: string, baseY: number, amplitude: number, jagged?: boolean) => Ridge
  sun: { x: number; y: number } // the sun, or the moon at night, already drawn
}

export type Painter = (c: PaintContext) => void

export const n = (v: number) => Math.round(v * 10) / 10
export const at = (x: number, y: number, s: number) => `translate(${n(x)},${n(y)}) scale(${n(s * 100) / 100})`

// Day colour, then its night colour.
export const COLORS = {
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
  bark: ['#6e5642', '#3a1c00'],
  birch: ['#f1ede2', '#a87000'],
  birchMark: ['#3f3a33', '#2a1200'],
  pine: ['#3f5f4a', '#2a1400'],
  pineLight: ['#56785e', '#3a1c00'],
  fern: ['#5f8f4e', '#6a3400'],
  moss: ['#7f9e55', '#5a2c00'],
  maple: ['#d0662e', '#b04800'],
  mapleGold: ['#e3a33a', '#c87800'],
  owl: ['#8a7058', '#5a3000'],
  owlFace: ['#e8dcc4', '#a86a00'],
  eye: ['#f2c94c', '#e09a00'],
  mist: ['#ffffff', '#7a4200'],
  acorn: ['#9a6e3e', '#6a3800'],
  acornCap: ['#6b4f33', '#3a1e00'],
  mushroom: ['#c8573e', '#a04000'],
  sand: ['#eadbb8', '#5a2c00'],
  sandDark: ['#d8c49a', '#462200'],
  sea: ['#8fb7c4', '#2a1400'],
  seaDeep: ['#6f9fb0', '#1e0e00'],
  foam: ['#f7f4ec', '#a05a00'],
  rock: ['#8e8a82', '#3a1c00'],
  rockDark: ['#6c6862', '#2a1400'],
  rockLight: ['#b0aba2', '#4a2600'],
  shell: ['#f1d6c8', '#b87000'],
  shellLine: ['#c9a08c', '#7a4200'],
  starfish: ['#e08a5a', '#c06000'],
  gull: ['#fbfbf8', '#b07000'],
  gullWing: ['#9aa3a8', '#6a3a00'],
  beak: ['#e8a83a', '#d08800'],
  stripe: ['#c4553f', '#a04000'],
  lamp: ['#fff2c0', '#f0a000'],
  kelp: ['#6d7a3a', '#4a2a00'],
  glassGreen: ['#9cc9a8', '#a06000'],
  glassBlue: ['#9cc0d8', '#c07a00'],
  glassAmber: ['#e0b070', '#d08a00'],
  pebble: ['#a9a49a', '#5a3000'],
  pebbleLight: ['#c9c2b5', '#6a3a00'],
  hull: ['#f2ece0', '#8a5000'],
  hullRed: ['#c0503a', '#9a3a00'],
  sail: ['#fbf7ee', '#b07000'],
  snow: ['#f8fafa', '#c88a00'],
  ice: ['#cfe3ec', '#9a5c00'],
  granite: ['#9a9a96', '#4a2600'],
  graniteDark: ['#7a7a76', '#341a00'],
  eagle: ['#5a4535', '#2a1200'],
  larch: ['#d9a93c', '#c08000'],
  marmot: ['#9b7550', '#6a3a00'],
  falls: ['#eef4f4', '#b07400'],
  sandstone: ['#d48a5a', '#8a3c00'],
  sandstoneDark: ['#b06a40', '#6a2a00'],
  canyon: ['#c25a3a', '#7a2a00'],
  canyonDark: ['#9a4028', '#5a1e00'],
  cactus: ['#6f8f5a', '#4a2600'],
  cactusDark: ['#577547', '#3a1c00'],
  palm: ['#5f8a4a', '#4a2600'],
  juniper: ['#5c7258', '#3a1e00'],
  copper: ['#c8743a', '#a04c00'],
  cactusFlower: ['#e676a0', '#d06a00'],
  band1: ['#c97a5a', '#8a3a00'],
  band2: ['#e2b98a', '#a86a00'],
  band3: ['#a8604a', '#6a2a00'],
  band4: ['#d8a070', '#9a5200'],
  aurora: ['#9be3b6', '#d08a00'],
  aurora2: ['#e5a6d6', '#a85a00'],
  fire: ['#f2a63a', '#f0a000'],
  fireCore: ['#fff0b0', '#ffc000'],
  glow: ['#ffe9a8', '#e09a00'],
  tent: ['#d8a25a', '#8a4a00'],
  lantern: ['#ffd27a', '#f0a800'],
  firefly: ['#fff3a0', '#ffb000'],
  starlight: ['#fffbe8', '#ffc000'],
} as const

export type Color = keyof typeof COLORS
export const colors = (night: boolean) => (name: Color) => COLORS[name][night ? 1 : 0]

// Near things are bigger: 0.3 at the horizon, 1 two-thirds down, more at the bottom edge.
export const depth = (y: number) => Math.max(0.3, (y - 380) / 260)

// Scatter things over a ground shape, between its surface and `below` units under it,
// drawn far to near so the near ones overlap.
export function scatter(r: () => number, count: number, ground: Ridge, below: number, draw: (x: number, y: number, s: number) => JSX.Element, from = 0, to = W) {
  const spots: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const x = from + r() * (to - from)
    const top = heightAt(ground, x)
    spots.push([x, top + 3 + r() * Math.max(0, Math.min(H, top + below) - top - 3)])
  }
  return spots.sort((a, b) => a[1] - b[1]).map(([x, y]) => draw(x, y, depth(y)))
}

// --- Flowers and things ----------------------------------------------------------------

export const clover = (x: number, y: number, s: number, fill: string) => (
  <g transform={at(x, y, s)} fill={fill}>
    <circle cx={0} cy={-3} r={3.1} />
    <circle cx={-2.8} cy={1.6} r={3.1} />
    <circle cx={2.8} cy={1.6} r={3.1} />
  </g>
)

export const cloverHead = (x: number, y: number, s: number, head: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-6 0,-11" stroke={stem} stroke-width={1} fill="none" />
    <circle cx={0} cy={-13} r={3.4} fill={head} />
  </g>
)

export const dandelion = (x: number, y: number, s: number, head: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q-1,-8 0,-15" stroke={stem} stroke-width={1.1} fill="none" />
    <circle cx={0} cy={-18} r={5.4} fill="none" stroke={head} stroke-width={2.2} stroke-dasharray="1.2 0.9" />
    <circle cx={0} cy={-18} r={4} fill={head} />
  </g>
)

export const puff = (x: number, y: number, s: number, seed: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-9 0,-18" stroke={stem} stroke-width={1} fill="none" />
    <circle cx={0} cy={-24} r={6.5} fill={seed} opacity={0.35} />
    <circle cx={0} cy={-24} r={6.5} fill="none" stroke={seed} stroke-width={1.6} stroke-dasharray="0.5 1.1" opacity={0.9} />
    <circle cx={0} cy={-24} r={1.2} fill={stem} />
  </g>
)

// A single dandelion seed drifting on the air.
export const seedling = (x: number, y: number, s: number, tilt: number, fill: string) => (
  <g transform={`${at(x, y, s)} rotate(${n(tilt)})`} stroke={fill} stroke-width={0.6} fill="none" opacity={0.85}>
    <path d="M0,0 L0,5" />
    <path d="M0,0 L-2.5,-2 M0,0 L-1,-3 M0,0 L1,-3 M0,0 L2.5,-2" />
  </g>
)

export const daisy = (x: number, y: number, s: number, petal: string, centre: string, stem: string) => (
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

export const poppy = (x: number, y: number, s: number, petal: string, centre: string, stem: string, open: boolean) => (
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

export const buttercup = (x: number, y: number, s: number, petal: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 Q1,-5 0,-10" stroke={stem} stroke-width={0.9} fill="none" />
    <g transform="translate(0,-12)" fill={petal}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle cx={0} cy={-1.9} r={1.8} transform={`rotate(${a})`} />
      ))}
    </g>
  </g>
)

export const bluebell = (x: number, y: number, s: number, bell: string, stem: string) => (
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

export const bloom = (x: number, y: number, s: number, petal: string, stem: string, tall: number) => (
  <g transform={at(x, y, s)}>
    <path d={`M0,0 Q1,${-tall / 2} 0,${-tall}`} stroke={stem} stroke-width={0.9} fill="none" />
    <circle cx={0} cy={-tall - 2} r={2.4} fill={petal} />
  </g>
)

export const grass = (x: number, y: number, s: number, color: string, lean: number, tall: number) => (
  <path transform={at(x, y, s)} d={`M0,0 Q${n(lean * 0.3)},${n(-tall * 0.6)} ${n(lean)},${n(-tall)}`} stroke={color} stroke-width={1.3} fill="none" stroke-linecap="round" />
)

export const lark = (x: number, y: number, s: number, color: string) => (
  <path transform={at(x, y, s)} d="M-7,0 Q-3.5,-4 0,0.5 Q3.5,-4 7,0" stroke={color} stroke-width={1.4} fill="none" stroke-linecap="round" />
)

export const bee = (x: number, y: number, s: number, body: string, wing: string, stripe: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={-1} cy={-2.6} rx={1.8} ry={1.4} fill={wing} opacity={0.75} />
    <ellipse cx={1.4} cy={-2.4} rx={1.6} ry={1.2} fill={wing} opacity={0.6} />
    <ellipse cx={0} cy={0} rx={2.8} ry={1.9} fill={body} />
    <path d="M-0.6,-1.8 L-0.6,1.8 M1.2,-1.6 L1.2,1.6" stroke={stripe} stroke-width={0.7} />
  </g>
)

// A straw beehive: stacked coils narrowing to a dome, with a little dark doorway.
export const skep = (x: number, y: number, s: number, straw: string, shade: string, door: string) => (
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

export const roundTree = (x: number, y: number, s: number, crown: string, trunk: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-2.5} y={-22} width={5} height={22} fill={trunk} />
    <circle cx={0} cy={-34} r={16} fill={crown} />
    <circle cx={-12} cy={-25} r={11} fill={crown} />
    <circle cx={12} cy={-26} r={12} fill={crown} />
  </g>
)

// A weeping willow: a soft crown with long strands hanging almost to the ground.
export function willow(r: () => number, x: number, y: number, s: number, crown: string, strand: string, trunk: string) {
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
export const gate = (x: number, y: number, s: number, wood: string, dark: string) => (
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

export const bale = (x: number, y: number, s: number, hay: string, shade: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-13} y={-22} width={26} height={22} rx={3} fill={shade} />
    <ellipse cx={13} cy={-11} rx={7} ry={11} fill={hay} />
    <ellipse cx={13} cy={-11} rx={3.6} ry={6} fill="none" stroke={shade} stroke-width={1} />
    <path d="M-13,-15 L13,-15 M-13,-8 L13,-8" stroke={hay} stroke-width={0.8} opacity={0.6} />
  </g>
)

// A ribbon that winds from a point on the horizon (t=0) to the bottom edge (t=1): a lane or a brook.
export function ribbon(far: [number, number], nearX: number, wiggle: number, nearWidth: number) {
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


// --- More things to paint ----------------------------------------------------------------

export const pine = (x: number, y: number, s: number, fill: string, trunk: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-1.6} y={-6} width={3.2} height={6} fill={trunk} />
    <path d="M0,-62 L-10,-40 L-5,-40 L-15,-20 L-8,-20 L-19,-4 L19,-4 L8,-20 L15,-20 L5,-40 L10,-40 Z" fill={fill} />
  </g>
)

export const birch = (x: number, y: number, s: number, bark: string, mark: string, leaf: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={0} cy={-74} rx={18} ry={26} fill={leaf} />
    <rect x={-2.4} y={-80} width={4.8} height={80} fill={bark} />
    {[-70, -58, -47, -33, -22, -10].map((my, i) => (
      <rect x={i % 2 ? -2.4 : -0.4} y={my} width={2.8} height={1.6} fill={mark} />
    ))}
  </g>
)

// A cedar: wide, flat tiers of foliage on a straight trunk.
export const cedar = (x: number, y: number, s: number, fill: string, trunk: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-2.5} y={-70} width={5} height={70} fill={trunk} />
    {[
      [-14, 26],
      [-30, 22],
      [-46, 17],
      [-60, 11],
      [-72, 6],
    ].map(([ty, rx]) => (
      <path d={`M${-rx},${ty + 4} Q${-rx * 0.4},${ty - 8} 0,${ty - 9} Q${rx * 0.4},${ty - 8} ${rx},${ty + 4} Q0,${ty} ${-rx},${ty + 4} Z`} fill={fill} />
    ))}
  </g>
)

export const bigOak = (x: number, y: number, s: number, crown: string, shade: string, trunk: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-9,0 Q-6,-30 -14,-52 L-4,-50 Q0,-36 4,-50 L14,-52 Q6,-30 9,0 Z" fill={trunk} />
    <circle cx={-30} cy={-62} r={24} fill={shade} />
    <circle cx={30} cy={-60} r={24} fill={shade} />
    <circle cx={0} cy={-78} r={30} fill={crown} />
    <circle cx={-22} cy={-72} r={22} fill={crown} />
    <circle cx={24} cy={-70} r={22} fill={crown} />
  </g>
)

// A fern: arching fronds, their leaflets drawn with a dashed thick stroke.
export const fern = (x: number, y: number, s: number, color: string) => (
  <g transform={at(x, y, s)} fill="none" stroke={color}>
    {[-60, -28, 0, 28, 60].map((a) => (
      <g transform={`rotate(${a})`}>
        <path d="M0,0 Q3,-14 9,-22" stroke-width={0.8} />
        <path d="M0,-2 Q3,-14 9,-22" stroke-width={5} stroke-dasharray="1 1.3" />
      </g>
    ))}
  </g>
)

export const owl = (x: number, y: number, s: number, body: string, face: string, eye: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={0} cy={-9} rx={6} ry={9} fill={body} />
    <path d="M-5,-15 L-4,-20 L-1,-16 M5,-15 L4,-20 L1,-16" fill={body} stroke={body} stroke-width={1.5} />
    <ellipse cx={0} cy={-13} rx={5} ry={3.6} fill={face} />
    <circle cx={-2.2} cy={-13} r={1.4} fill={eye} />
    <circle cx={2.2} cy={-13} r={1.4} fill={eye} />
  </g>
)

export const mist = (x: number, y: number, w: number, h: number, color: string, opacity: number) => (
  <ellipse cx={n(x)} cy={n(y)} rx={n(w / 2)} ry={n(h / 2)} fill={color} opacity={opacity} />
)

export const acorn = (x: number, y: number, s: number, nut: string, cap: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={0} cy={-3} rx={2.4} ry={3.2} fill={nut} />
    <path d="M-2.8,-4.6 Q0,-8 2.8,-4.6 Z" fill={cap} />
  </g>
)

export const mushroom = (x: number, y: number, s: number, cap: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <rect x={-1.2} y={-6} width={2.4} height={6} fill={stem} />
    <path d="M-6,-5 Q0,-14 6,-5 Z" fill={cap} />
  </g>
)

// A plane of water from `top` down to the bottom, with soft ripple lines.
export function water(r: () => number, top: number, fill: string, ripple: string, bottom = H) {
  const parts: JSX.Element[] = [<rect x={0} y={n(top)} width={W} height={n(bottom - top)} fill={fill} />]
  for (let i = 0; i < 14; i++) {
    const y = top + 8 + (bottom - top - 10) * (i / 14) ** 1.4
    const s = depth(y)
    const x = r() * W
    parts.push(<path d={`M${n(x)},${n(y)} q${n(18 * s)},${n(-2 * s)} ${n(36 * s)},0`} stroke={ripple} stroke-width={n(0.6 + s * 0.6)} fill="none" opacity={0.6} />)
  }
  return parts
}

// Sunlight (or moonlight) on water: broken streaks under the sun.
export function glitter(r: () => number, x: number, top: number, bottom: number, color: string) {
  const parts: JSX.Element[] = []
  for (let y = top + 4; y < bottom; y += 7 + (y - top) * 0.05) {
    const w = 8 + (y - top) * 0.25 + r() * 10
    parts.push(<rect x={n(x - w / 2 + (r() - 0.5) * 10)} y={n(y)} width={n(w)} height={n(1.2 + (y - top) * 0.01)} rx={1} fill={color} opacity={0.75} />)
  }
  return parts
}

export const shell = (x: number, y: number, s: number, fill: string, line: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 L-6,-4 Q-6,-10 0,-11 Q6,-10 6,-4 Z" fill={fill} stroke={line} stroke-width={0.5} />
    <path d="M0,-1 L-3.2,-9 M0,-1 L0,-10 M0,-1 L3.2,-9" stroke={line} stroke-width={0.5} />
    <rect x={-2} y={-1.5} width={4} height={2} rx={0.6} fill={line} />
  </g>
)

export const starfish = (x: number, y: number, s: number, fill: string) => (
  <path transform={at(x, y, s)} d="M0,-6 L1.6,-1.8 L6,-1.8 L2.6,1 L3.8,5.6 L0,3 L-3.8,5.6 L-2.6,1 L-6,-1.8 L-1.6,-1.8 Z" fill={fill} />
)

export const gull = (x: number, y: number, s: number, body: string, wing: string, beak: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-1,-1 L-1,4 M2,-1 L2,4" stroke={beak} stroke-width={0.8} />
    <ellipse cx={0} cy={-4} rx={7} ry={3.6} fill={body} />
    <path d="M-6,-5 Q0,-8 5,-4 L-2,-3 Z" fill={wing} />
    <circle cx={6} cy={-8} r={2.6} fill={body} />
    <path d="M8.4,-8 L11,-7.4 L8.4,-6.8 Z" fill={beak} />
  </g>
)

export const sandpiper = (x: number, y: number, s: number, body: string, leg: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-1,-2 L-1.6,3 M1,-2 L1.6,3" stroke={leg} stroke-width={0.6} />
    <ellipse cx={0} cy={-4} rx={4} ry={2.4} fill={body} />
    <circle cx={3.6} cy={-6} r={1.6} fill={body} />
    <path d="M5,-6 L8.6,-5.6" stroke={leg} stroke-width={0.6} />
  </g>
)

export const lighthouse = (x: number, y: number, s: number, white: string, band: string, lamp: string, dark: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-9,0 L-6,-60 L6,-60 L9,0 Z" fill={white} />
    <path d="M-8.2,-16 L-7.4,-28 L7.4,-28 L8.2,-16 Z M-6.9,-40 L-6.4,-50 L6.4,-50 L6.9,-40 Z" fill={band} />
    <rect x={-8} y={-62} width={16} height={3} fill={dark} />
    <rect x={-4.5} y={-71} width={9} height={9} fill={lamp} />
    <path d="M-6,-71 L0,-77 L6,-71 Z" fill={dark} />
    <path d="M4,-67 L60,-78 L60,-58 Z M-4,-67 L-60,-78 L-60,-58 Z" fill={lamp} opacity={0.25} />
  </g>
)

export const kelp = (x: number, y: number, s: number, color: string, tall: number) => (
  <path transform={at(x, y, s)} d={`M0,0 q-4,${n(-tall / 4)} 0,${n(-tall / 2)} t0,${n(-tall / 2)}`} stroke={color} stroke-width={2.2} fill="none" stroke-linecap="round" />
)

export const pebble = (x: number, y: number, s: number, fill: string) => <ellipse cx={n(x)} cy={n(y)} rx={n(4 * s)} ry={n(2.6 * s)} fill={fill} />

export const boat = (x: number, y: number, s: number, hull: string, trim: string, sail: string, mast: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-16,-6 L16,-6 L11,0 L-11,0 Z" fill={hull} />
    <rect x={-16} y={-7} width={32} height={1.6} fill={trim} />
    <rect x={-0.6} y={-34} width={1.2} height={28} fill={mast} />
    <path d="M1,-33 L14,-9 L1,-9 Z" fill={sail} />
  </g>
)

// Snow on the peaks of a jagged ridge: a cap over every summit higher than `below`.
export function snowcaps(shape: Ridge, below: number, color: string) {
  const caps: JSX.Element[] = []
  const t = shape.tops
  for (let i = 1; i < t.length - 1; i++) {
    const [x, y] = t[i]
    if (y < t[i - 1][1] && y <= t[i + 1][1] && y < below) {
      const h = Math.min(26, below - y)
      caps.push(<path d={`M${n(x)},${n(y)} L${n(x - h * 0.9)},${n(y + h)} L${n(x - h * 0.3)},${n(y + h * 0.7)} L${n(x)},${n(y + h)} L${n(x + h * 0.4)},${n(y + h * 0.7)} L${n(x + h * 0.9)},${n(y + h)} Z`} fill={color} />)
    }
  }
  return caps
}

export const eagle = (x: number, y: number, s: number, color: string) => (
  <path transform={at(x, y, s)} d="M-16,-2 Q-9,-7 -3,-2 L-1,-4 L1,-4 L3,-2 Q9,-7 16,-2 Q9,-3 3,0 L1,3 L-1,3 L-3,0 Q-9,-3 -16,-2 Z" fill={color} />
)

export const edelweiss = (x: number, y: number, s: number, petal: string, centre: string, stem: string) => (
  <g transform={at(x, y, s)}>
    <path d="M0,0 L0,-9" stroke={stem} stroke-width={1} />
    <g transform="translate(0,-11)">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path d="M0,0 L-1.4,-2 L0,-5 L1.4,-2 Z" fill={petal} transform={`rotate(${a})`} />
      ))}
      <circle r={1.3} fill={centre} />
    </g>
  </g>
)

export const marmot = (x: number, y: number, s: number, fur: string, dark: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={0} cy={-7} rx={4.5} ry={7} fill={fur} />
    <circle cx={0} cy={-15} r={3.4} fill={fur} />
    <circle cx={-1.2} cy={-15.6} r={0.6} fill={dark} />
    <circle cx={1.2} cy={-15.6} r={0.6} fill={dark} />
    <ellipse cx={0} cy={-13.6} rx={1.2} ry={0.8} fill={dark} />
  </g>
)

export const saguaro = (x: number, y: number, s: number, fill: string, shade: string) => (
  <g transform={at(x, y, s)} fill={fill}>
    <rect x={-5} y={-64} width={10} height={64} rx={5} />
    <path d="M-5,-30 L-12,-30 Q-16,-30 -16,-36 L-16,-48 Q-16,-52 -12.5,-52 Q-9,-52 -9,-48 L-9,-37 L-5,-37 Z" />
    <path d="M5,-22 L12,-22 Q16,-22 16,-28 L16,-44 Q16,-48 12.5,-48 Q9,-48 9,-44 L9,-29 L5,-29 Z" />
    <path d="M-1.5,-60 L-1.5,-2 M1.8,-60 L1.8,-2" stroke={shade} stroke-width={0.8} />
  </g>
)

export const pricklyPear = (x: number, y: number, s: number, pad: string, flower: string) => (
  <g transform={at(x, y, s)}>
    <ellipse cx={0} cy={-9} rx={6} ry={9} fill={pad} />
    <ellipse cx={-7} cy={-20} rx={4.5} ry={7} fill={pad} transform="rotate(-25 -7 -20)" />
    <ellipse cx={6} cy={-22} rx={4.5} ry={7} fill={pad} transform="rotate(20 6 -22)" />
    <circle cx={-9} cy={-27} r={2.4} fill={flower} />
    <circle cx={8} cy={-29} r={2.4} fill={flower} />
    <circle cx={1} cy={-18.5} r={2} fill={flower} />
  </g>
)

export const palm = (x: number, y: number, s: number, trunk: string, frond: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-2,0 Q2,-30 -4,-62 L0,-62 Q6,-30 2,0 Z" fill={trunk} />
    {[-150, -115, -80, -45, -10, 25].map((a) => (
      <path transform={`translate(-2,-62) rotate(${a})`} d="M0,0 Q14,-8 28,4 Q14,-3 0,0 Z" fill={frond} />
    ))}
  </g>
)

export const shrub = (x: number, y: number, s: number, fill: string) => (
  <g transform={at(x, y, s)} fill={fill}>
    <ellipse cx={0} cy={-6} rx={10} ry={6} />
    <ellipse cx={-6} cy={-9} rx={6} ry={5} />
    <ellipse cx={5} cy={-10} rx={6} ry={5} />
  </g>
)

export const tent = (x: number, y: number, s: number, canvas: string, dark: string) => (
  <g transform={at(x, y, s)}>
    <path d="M-20,0 L0,-26 L20,0 Z" fill={canvas} />
    <path d="M-4,0 L0,-20 L4,0 Z" fill={dark} />
    <path d="M0,-26 L0,-30" stroke={dark} stroke-width={1} />
  </g>
)

export const campfire = (x: number, y: number, s: number, fire: string, core: string, glow: string, log: string) => (
  <g transform={at(x, y, s)}>
    <circle cx={0} cy={-6} r={26} fill={glow} opacity={0.25} />
    <circle cx={0} cy={-6} r={14} fill={glow} opacity={0.3} />
    <path d="M-10,0 L10,-4 M-10,-4 L10,0" stroke={log} stroke-width={3} stroke-linecap="round" />
    <path d="M-6,-2 Q-7,-12 0,-20 Q7,-12 6,-2 Z" fill={fire} />
    <path d="M-3,-2 Q-3,-8 0,-13 Q3,-8 3,-2 Z" fill={core} />
  </g>
)

export const lantern = (x: number, y: number, s: number, light: string, frame: string) => (
  <g transform={at(x, y, s)}>
    <circle cx={0} cy={4} r={12} fill={light} opacity={0.25} />
    <path d="M0,-6 L0,-2" stroke={frame} stroke-width={0.8} />
    <rect x={-3} y={-2} width={6} height={9} rx={1.5} fill={light} />
    <rect x={-3.6} y={-2.6} width={7.2} height={1.4} fill={frame} />
    <rect x={-3.6} y={6.6} width={7.2} height={1.4} fill={frame} />
  </g>
)

export const shootingStar = (x: number, y: number, len: number, color: string) => (
  <g>
    <path d={`M${n(x)},${n(y)} l${n(-len)},${n(-len * 0.45)}`} stroke={color} stroke-width={1.4} stroke-linecap="round" opacity={0.7} />
    <circle cx={n(x)} cy={n(y)} r={1.8} fill={color} />
  </g>
)

// A wide curtain of light across the sky, made of soft wavy ribbons.
export function aurora(r: () => number, y: number, colors: string[]) {
  const parts: JSX.Element[] = []
  for (let i = 0; i < 6; i++) {
    const base = y + i * 9 + r() * 10
    const ph = r() * 6
    let d = `M-10,${n(base)}`
    for (let x = 0; x <= W + 20; x += 20) d += ` L${x},${n(base + Math.sin(x / 55 + ph) * 22)}`
    parts.push(<path d={d} stroke={colors[i % colors.length]} stroke-width={n(16 + r() * 18)} fill="none" opacity={0.22} stroke-linecap="round" />)
  }
  return parts
}

// A plank walkway (dock or pier) running out from the near shore toward the far water.
export function pier(far: [number, number], near: [number, number], farWidth: number, nearWidth: number, plank: string, post: string) {
  const parts: JSX.Element[] = []
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const edge = (t: number) => {
    const x = lerp(far[0], near[0], t)
    const y = lerp(far[1], near[1], t)
    const w = lerp(farWidth, nearWidth, t)
    return { x, y, w }
  }
  const a = edge(0)
  const b = edge(1)
  parts.push(<path d={`M${n(a.x - a.w / 2)},${n(a.y)} L${n(a.x + a.w / 2)},${n(a.y)} L${n(b.x + b.w / 2)},${n(b.y)} L${n(b.x - b.w / 2)},${n(b.y)} Z`} fill={plank} />)
  for (let i = 0; i <= 12; i++) {
    const q = edge((i / 12) ** 1.3)
    const s = depth(q.y)
    parts.push(<path d={`M${n(q.x - q.w / 2)},${n(q.y)} L${n(q.x + q.w / 2)},${n(q.y)}`} stroke={post} stroke-width={n(0.5 + s * 0.6)} />)
    if (i % 3 === 0) {
      parts.push(<rect x={n(q.x - q.w / 2 - 2 * s)} y={n(q.y)} width={n(3 * s)} height={n(16 * s)} fill={post} />)
      parts.push(<rect x={n(q.x + q.w / 2 - 1 * s)} y={n(q.y)} width={n(3 * s)} height={n(16 * s)} fill={post} />)
    }
  }
  return { parts, edge }
}
