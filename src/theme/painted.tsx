// Painted landscapes drawn in code: the fallback scenery for any journey without images.
// Each location gets its own variation (seeded by pack id), and places listed in places.tsx
// get a painting of their own. Night palettes have no blue at all, so these never need the
// night filter.
import type { JSX } from 'preact'
import { useMemo } from 'preact/hooks'
import { PLACES } from './places'
import { H, rng, ridge, W, type Palette } from './paint-kit'

const PALETTES: Record<string, { day: Palette; night: Palette }> = {
  Meadow: {
    day: { sky: ['#cfe1e6', '#f4ecd6'], glow: '#fff6dc', layers: ['#b4c6a6', '#98b48c', '#7b9d70', '#5f8557'], accent: '#f6efc8' },
    night: { sky: ['#070300', '#261100'], glow: '#d88a00', layers: ['#2e1500', '#231000', '#190b00', '#100600'], accent: '#a85a00' },
  },
  Forest: {
    day: { sky: ['#d6e3db', '#eff0e1'], glow: '#fbf6e4', layers: ['#a7bba9', '#83a08a', '#5f7f68', '#43614c'], accent: '#e8efe0' },
    night: { sky: ['#060200', '#1f0e00'], glow: '#c47800', layers: ['#2a1300', '#1f0e00', '#160900', '#0d0500'], accent: '#8a4800' },
  },
  Coast: {
    day: { sky: ['#cbe0ec', '#f5ecdb'], glow: '#fff7e0', layers: ['#a3b5ae', '#e6d9bd'], accent: '#f7f3ea', water: '#8db4c2' },
    night: { sky: ['#070300', '#251100'], glow: '#e09000', layers: ['#2c1400', '#2a1300'], accent: '#b86400', water: '#1a0b00' },
  },
  Mountain: {
    day: { sky: ['#c6d9e7', '#eef1ec'], glow: '#fffbe9', layers: ['#b9c4ce', '#95a5b2', '#7a8f7e', '#5b735f'], accent: '#f6f8f8' },
    night: { sky: ['#050200', '#1d0d00'], glow: '#d08400', layers: ['#3a1c00', '#2b1400', '#1d0d00', '#120700'], accent: '#7a4200' },
  },
  Desert: {
    day: { sky: ['#efd9be', '#f8efdc'], glow: '#fff3d4', layers: ['#c99a77', '#dcb48c', '#d09a6c', '#b67e52'], accent: '#f3e1c2' },
    night: { sky: ['#080300', '#2c1300'], glow: '#e89a00', layers: ['#3a1a00', '#301500', '#231000', '#170900'], accent: '#a05600' },
  },
  'Night Sky': {
    day: { sky: ['#b7aec9', '#eec2a2'], glow: '#fff0d8', layers: ['#9c8fa8', '#83768f', '#695d76', '#52475e'], accent: '#fff4e0' },
    night: { sky: ['#040100', '#1a0b00'], glow: '#f0a000', layers: ['#241000', '#1b0c00', '#130800', '#0b0400'], accent: '#d07a00' },
  },
}

// Night palettes are written dark and lifted here; scaling a colour with no blue keeps it blue-free.
const NIGHT_LIFT = 1.7
const lift = (hex: string) =>
  '#' + [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * NIGHT_LIFT)).toString(16).padStart(2, '0')).join('')

function palette(journey: string, night: boolean): Palette {
  const p = (PALETTES[journey] ?? PALETTES.Meadow)[night ? 'night' : 'day']
  if (!night) return p
  return { ...p, sky: [p.sky[0], lift(p.sky[1])], layers: p.layers.map(lift), water: p.water && lift(p.water) }
}

export function scene(journey: string, seed: number, night: boolean, place?: string) {
  const p = palette(journey, night)
  const r = rng(seed)
  const parts: JSX.Element[] = []
  const starCount = journey === 'Night Sky' ? 90 : night ? 40 : 0
  for (let i = 0; i < starCount; i++) {
    parts.push(<circle cx={r() * W} cy={r() * H * 0.45} r={r() * 1.3 + 0.3} fill={p.accent} opacity={0.3 + r() * 0.6} />)
  }
  // Low over the horizon, in the open sky between the grid and the wheel.
  const sunX = 60 + r() * 280
  const sunY = 330 + r() * 60
  parts.push(<circle cx={sunX} cy={sunY} r={night ? 26 : 38} fill={p.glow} opacity={night ? 0.8 : 0.9} />)

  const layer = (color: string, baseY: number, amplitude: number, jagged = false) => {
    const shape = ridge(r, baseY, amplitude, jagged)
    parts.push(<path d={shape.d} fill={color} />)
    return shape
  }

  // Places with their own painting show what their name says.
  const paint = place && PLACES[place]
  if (paint) {
    paint({ p, r, night, add: (el) => parts.push(el), layer })
    return { p, parts }
  }

  if (journey === 'Coast') {
    layer(p.layers[0], 450, 40) // headland
    parts.push(<rect x={0} y={470} width={W} height={H - 470} fill={p.water} />)
    for (let i = 0; i < 9; i++) {
      const y = 490 + i * 22 + r() * 8
      parts.push(<path d={`M${r() * 120},${y} q60,-6 120,0 t120,0`} stroke={p.accent} stroke-width={1.2} fill="none" opacity={0.25 + i * 0.03} />)
    }
    layer(p.layers[1], 700, 25) // sand
  } else if (journey === 'Mountain') {
    layer(p.layers[0], 430, 75, true)
    layer(p.layers[1], 510, 60, true)
    layer(p.layers[2], 600, 40)
    layer(p.layers[3], 700, 25)
  } else if (journey === 'Desert') {
    // A flat-topped mesa, then sweeping dunes.
    const mx = 40 + r() * 200
    parts.push(<path d={`M${mx},480 L${mx + 20},360 L${mx + 140},360 L${mx + 165},480 Z`} fill={p.layers[0]} />)
    layer(p.layers[1], 520, 50)
    layer(p.layers[2], 610, 60)
    layer(p.layers[3], 710, 45)
  } else {
    layer(p.layers[0], 440, 45)
    const mid = layer(p.layers[1], 530, 40)
    if (journey === 'Forest') {
      // Rows of pines standing on the ridges.
      for (const [row, shape, size] of [[1, mid, 34], [2, layer(p.layers[2], 620, 30), 48]] as const) {
        for (const [x, y] of shape.tops) {
          if (r() < 0.55) continue
          const h = size * (0.7 + r() * 0.6)
          parts.push(<path d={`M${x},${y - h} L${x - h * 0.32},${y + 4} L${x + h * 0.32},${y + 4} Z`} fill={p.layers[Math.min(row + 1, 3)]} />)
        }
      }
    } else {
      layer(p.layers[2], 620, 35)
    }
    const near = layer(p.layers[3], 720, 25)
    if (journey === 'Meadow') {
      for (let i = 0; i < 60; i++) {
        const [x, y] = near.tops[Math.floor(r() * near.tops.length)]
        parts.push(<circle cx={x + r() * 8} cy={y + 10 + r() * 70} r={1.2 + r() * 1.6} fill={p.accent} opacity={0.7} />)
      }
    }
  }
  return { p, parts }
}

export function PaintedScene({ journey, seed, night, place }: { journey: string; seed: number; night: boolean; place?: string }) {
  const { p, parts } = useMemo(() => scene(journey, seed, night, place), [journey, seed, night, place])
  // Unique per scene: postcards put many paintings on one page.
  const sky = `painted-sky-${journey.replace(/\s/g, '')}-${seed}-${night ? 'n' : 'd'}`
  return (
    <svg class="scene-media" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={p.sky[0]} />
          <stop offset="0.6" stop-color={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${sky})`} />
      {parts}
    </svg>
  )
}
