// The Coast's places. The sea meets the sky at 470; the Coast palette has a headland colour
// and a sand colour, so most colours here come from the kit.
import { H, heightAt, surface, W } from '../paint-kit'
import { boat, colors, depth, glitter, grass, gull, kelp, lark, lighthouse, n, pebble, sandpiper, scatter, shell, starfish, water, type PaintContext, type Painter } from './kit'

const SEA = 470

// The open sea from the horizon down, with a headland on one side.
function sea({ p, r, night, add }: PaintContext, headland: boolean) {
  const c = colors(night)
  if (headland) {
    const left = r() < 0.5
    add(<path d={left ? `M0,${SEA} L0,${SEA - 40} Q60,${SEA - 55} 120,${SEA - 20} Q150,${SEA - 5} 170,${SEA} Z` : `M${W},${SEA} L${W},${SEA - 40} Q${W - 60},${SEA - 55} ${W - 120},${SEA - 20} Q${W - 150},${SEA - 5} ${W - 170},${SEA} Z`} fill={p.layers[0]} />)
  }
  water(r, SEA, p.water ?? c('sea'), c('foam')).forEach(add)
}

// A gentle line of foam where a wave runs up the sand.
const foamLine = (shore: (x: number) => number, color: string) => {
  let d = ''
  for (let x = 0; x <= W; x += 8) d += `${x ? ' L' : 'M'}${x},${n(shore(x) - 2 + Math.sin(x / 9) * 1.5)}`
  return <path d={d} stroke={color} stroke-width={3} fill="none" opacity={0.85} stroke-linecap="round" />
}

const driftwoodBay: Painter = (ctx) => {
  const { p, r, night, add, sun } = ctx
  const c = colors(night)
  sea(ctx, true)
  glitter(r, sun.x, SEA, 560, c('foam')).forEach(add)
  const shore = (x: number) => 600 - 60 * Math.sin((Math.PI * x) / W) + Math.sin(x / 40) * 4
  const beach = surface(shore)
  add(<path d={beach.d} fill={p.layers[1]} />)
  add(foamLine(shore, c('foam')))
  // Pale, worn logs lying on the sand.
  for (let i = 0; i < 5; i++) {
    const x = 30 + r() * 340
    const y = heightAt(beach, x) + 30 + r() * 140
    const s = depth(y)
    const a = (r() - 0.5) * 30
    add(<g transform={`translate(${n(x)},${n(y)}) rotate(${n(a)}) scale(${n(s)})`}><rect x={-34} y={-4} width={68} height={8} rx={4} fill={c('rockLight')} /><path d="M-20,-1 L10,-1 M-5,2 L24,2" stroke={c('rock')} stroke-width={0.8} /><path d="M18,-4 L30,-12" stroke={c('rockLight')} stroke-width={3} stroke-linecap="round" /></g>)
  }
  scatter(r, 30, beach, 200, (x, y, s) => pebble(x, y, s * 0.6, c('sandDark'))).forEach(add)
}

const seashellCove: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, false)
  // Rocky arms on both sides close the cove in.
  add(<path d={`M0,${SEA - 10} Q70,${SEA - 30} 110,560 Q90,620 0,640 Z`} fill={p.layers[0]} />)
  add(<path d={`M${W},${SEA - 14} Q${W - 80},${SEA - 34} ${W - 120},560 Q${W - 100},620 ${W},650 Z`} fill={p.layers[0]} />)
  const shore = (x: number) => 610 + Math.sin(x / 50) * 6
  const beach = surface(shore)
  add(<path d={beach.d} fill={p.layers[1]} />)
  add(foamLine(shore, c('foam')))
  scatter(r, 60, beach, 200, (x, y, s) => (r() < 0.8 ? shell(x, y, s * 2, c('shell'), c('shellLine')) : starfish(x, y, s, c('starfish')))).forEach(add)
}

const tidepoolPoint: Painter = (ctx) => {
  const { r, night, add } = ctx
  const c = colors(night)
  sea(ctx, true)
  // A rocky point reaching out into the sea, dotted with pools.
  const rocks = surface((x) => 560 - 70 * (x / W) + Math.sin(x / 18) * 6 + Math.sin(x / 7) * 3)
  add(<path d={rocks.d} fill={c('rock')} />)
  for (let i = 0; i < 20; i++) {
    const x = r() * W
    const y = heightAt(rocks, x) + 10 + r() * 200
    add(<ellipse cx={n(x)} cy={n(y)} rx={n(14 * depth(y))} ry={n(6 * depth(y))} fill={c('rockDark')} />)
  }
  for (let i = 0; i < 9; i++) {
    const x = 30 + r() * 340
    const y = heightAt(rocks, x) + 30 + r() * 170
    const s = depth(y)
    add(<ellipse cx={n(x)} cy={n(y)} rx={n(30 * s)} ry={n(11 * s)} fill={c('water')} />)
    add(<ellipse cx={n(x - 6 * s)} cy={n(y - 2 * s)} rx={n(12 * s)} ry={n(3 * s)} fill={c('ripple')} opacity={0.5} />)
    if (r() < 0.7) add(starfish(x + (r() - 0.5) * 30 * s, y + (r() - 0.5) * 6 * s, s * 1.2, c('starfish')))
  }
}

const gullRock: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, false)
  const gx = 120 + r() * 160
  add(<path d={`M${gx - 90},585 Q${gx - 70},520 ${gx - 30},500 Q${gx},480 ${gx + 30},498 Q${gx + 75},520 ${gx + 95},585 Z`} fill={c('rock')} />)
  add(<path d={`M${gx - 30},500 Q${gx},480 ${gx + 30},498 Q${gx + 10},505 ${gx - 30},504 Z`} fill={c('rockLight')} />)
  add(<path d={`M${gx - 95},585 Q${gx},575 ${gx + 100},585`} stroke={c('foam')} stroke-width={3} fill="none" />)
  for (const [dx, dy] of [[-30, 502], [5, 488], [35, 503]]) add(gull(gx + dx, dy, 1.4, c('gull'), c('gullWing'), c('beak')))
  for (let i = 0; i < 6; i++) add(lark(40 + r() * 320, 330 + r() * 120, 1.4 + r() * 0.8, c('gullWing')))
  const shore = (x: number) => 720 + Math.sin(x / 60) * 6
  add(<path d={surface(shore).d} fill={p.layers[1]} />)
  add(foamLine(shore, c('foam')))
}

const sandpiperBeach: Painter = (ctx) => {
  const { p, r, night, add, sun } = ctx
  const c = colors(night)
  sea(ctx, true)
  glitter(r, sun.x, SEA, 540, c('foam')).forEach(add)
  const wet = (x: number) => 560 + x * 0.12 + Math.sin(x / 45) * 4
  add(<path d={surface(wet).d} fill={c('sandDark')} />)
  add(foamLine(wet, c('foam')))
  const dry = surface((x) => 640 + x * 0.08 + Math.sin(x / 55) * 5)
  add(<path d={dry.d} fill={p.layers[1]} />)
  // A little flock running along the water's edge.
  const flock = 60 + r() * 200
  for (let i = 0; i < 9; i++) {
    const x = flock + i * 18 + r() * 10
    const y = wet(x) + 12 + r() * 50
    add(sandpiper(x, y, depth(y) * 2.2, c('marmot'), c('dark')))
  }
}

const lighthouseBluff: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, false)
  const left = r() < 0.5
  const top = (x: number) => 520 + Math.sin(x / 30) * 3
  const edge = left ? 230 : 170
  add(<path d={left ? `M0,${H} L0,${top(0)} L${edge},${top(edge)} Q${edge + 20},600 ${edge + 10},${H} Z` : `M${W},${H} L${W},${top(W)} L${edge},${top(edge)} Q${edge - 20},600 ${edge - 10},${H} Z`} fill={c('rock')} />)
  add(<path d={left ? `M0,${top(0) - 4} L${edge + 4},${top(edge) - 2} L${edge},${top(edge) + 10} L0,${top(0) + 14} Z` : `M${W},${top(W) - 4} L${edge - 4},${top(edge) - 2} L${edge},${top(edge) + 10} L${W},${top(W) + 14} Z`} fill={p.layers[0]} />)
  const lx = left ? edge - 70 : edge + 70
  add(lighthouse(lx, top(lx) + 2, 1.5, c('gull'), c('stripe'), c('lamp'), c('dark')))
  const foamX = left ? edge + 14 : edge - 14
  add(<path d={`M${foamX - 30},700 Q${foamX},690 ${foamX + 30},700`} stroke={c('foam')} stroke-width={3} fill="none" />)
}

const kelpShallows: Painter = (ctx) => {
  const { r, night, add } = ctx
  const c = colors(night)
  sea(ctx, true)
  // Clear water over sand, with kelp swaying up from the bottom.
  add(<rect x={0} y={560} width={W} height={H - 560} fill={c('water')} opacity={0.9} />)
  for (let i = 0; i < 26; i++) {
    const y = 600 + r() * 200
    add(kelp(r() * W, y, depth(y) * 1.2, c('kelp'), 40 + r() * 50))
  }
  for (let i = 0; i < 12; i++) {
    const y = 620 + r() * 180
    add(<ellipse cx={n(r() * W)} cy={n(y)} rx={n(14 * depth(y))} ry={n(6 * depth(y))} fill={c('rock')} />)
  }
  for (let i = 0; i < 10; i++) {
    const y = 570 + r() * 220
    add(<path d={`M${n(r() * W)},${n(y)} q14,-3 28,0`} stroke={c('ripple')} stroke-width={1} fill="none" opacity={0.7} />)
  }
}

const seaGlassShore: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, true)
  const shore = (x: number) => 580 + Math.sin(x / 48) * 6
  const beach = surface(shore)
  add(<path d={beach.d} fill={p.layers[1]} />)
  add(foamLine(shore, c('foam')))
  scatter(r, 80, beach, 220, (x, y, s) => pebble(x, y, s * 0.9, r() < 0.5 ? c('pebble') : c('pebbleLight'))).forEach(add)
  const glass = [c('glassGreen'), c('glassBlue'), c('glassAmber')]
  scatter(r, 60, beach, 220, (x, y, s) => <path transform={`translate(${n(x)},${n(y)}) rotate(${n(r() * 360)}) scale(${n(s * 1.4)})`} d="M-3,-2 L2,-3 L4,1 L0,3 L-3,1 Z" fill={glass[Math.floor(r() * 3)]} opacity={0.9} />).forEach(add)
}

const pebbleStrand: Painter = (ctx) => {
  const { r, night, add } = ctx
  const c = colors(night)
  sea(ctx, true)
  const shore = (x: number) => 560 + Math.sin(x / 70) * 5
  const strand = surface(shore)
  add(<path d={strand.d} fill={c('pebble')} />)
  add(foamLine(shore, c('foam')))
  const tones = [c('pebble'), c('pebbleLight'), c('rockLight'), c('rock')]
  scatter(r, 420, strand, 260, (x, y, s) => pebble(x, y, s * (0.8 + r() * 0.6), tones[Math.floor(r() * 4)])).forEach(add)
}

const harborLight: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, false)
  // A stone harbour wall curving out, with a small light at its end and boats inside.
  const left = r() < 0.5
  const end = left ? 260 : 140
  add(<path d={left ? `M0,640 Q150,560 ${end},530 L${end},544 Q150,580 0,662 Z` : `M${W},640 Q250,560 ${end},530 L${end},544 Q250,580 ${W},662 Z`} fill={c('rock')} />)
  add(<rect x={end - 6} y={498} width={12} height={34} fill={c('gull')} />)
  add(<rect x={end - 6} y={508} width={12} height={6} fill={c('stripe')} />)
  add(<rect x={end - 5} y={490} width={10} height={8} fill={c('lamp')} />)
  add(<circle cx={end} cy={494} r={16} fill={c('lamp')} opacity={0.25} />)
  for (let i = 0; i < 4; i++) {
    const x = left ? 40 + i * 50 + r() * 20 : 180 + i * 50 + r() * 20
    const y = 640 + r() * 40
    add(boat(x, y, depth(y) * 1.4, i % 2 ? c('hull') : c('hullRed'), c('dark'), c('sail'), c('woodDark')))
  }
  const quay = surface((x) => 740 + Math.sin(x / 80) * 2)
  add(<path d={quay.d} fill={c('rockDark')} />)
  add(<path d={`M0,740 L${W},740`} stroke={p.layers[1]} stroke-width={3} />)
}

const duneGrassWay: Painter = (ctx) => {
  const { p, r, night, add } = ctx
  const c = colors(night)
  sea(ctx, true)
  const dune1 = surface((x) => 520 + Math.sin(x / 60 + 1) * 18)
  add(<path d={dune1.d} fill={c('sandDark')} />)
  scatter(r, 70, dune1, 20, (x, y, s) => grass(x, y, s, c('moss'), (r() - 0.5) * 10, 16 + r() * 10)).forEach(add)
  const dune2 = surface((x) => 610 + Math.sin(x / 70 + 3) * 26)
  add(<path d={dune2.d} fill={p.layers[1]} />)
  // A sandy way between fence posts, down through the dunes toward the sea.
  const wx = 150 + r() * 100
  add(<path d={`M${wx - 6},${heightAt(dune2, wx)} L${wx + 6},${heightAt(dune2, wx)} L${wx + 70},${H} L${wx - 70},${H} Z`} fill={c('sand')} />)
  for (let i = 0; i < 6; i++) {
    const t = i / 5
    const y = heightAt(dune2, wx) + (H - heightAt(dune2, wx)) * t
    const s = depth(y)
    for (const side of [-1, 1]) add(<rect x={n(wx + side * (8 + 70 * t) - 1.5 * s)} y={n(y - 14 * s)} width={n(3 * s)} height={n(14 * s)} fill={c('woodDark')} />)
  }
  scatter(r, 160, dune2, 200, (x, y, s) => (Math.abs(x - wx) < 20 + (y - 600) * 0.4 ? <g /> : grass(x, y, s, r() < 0.5 ? c('moss') : c('kelp'), (r() - 0.5) * 12, 18 + r() * 16))).forEach(add)
}

export const COAST: Record<string, Painter> = {
  'Driftwood Bay': driftwoodBay,
  'Seashell Cove': seashellCove,
  'Tidepool Point': tidepoolPoint,
  'Gull Rock': gullRock,
  'Sandpiper Beach': sandpiperBeach,
  'Lighthouse Bluff': lighthouseBluff,
  'Kelp Shallows': kelpShallows,
  'Sea Glass Shore': seaGlassShore,
  'Pebble Strand': pebbleStrand,
  'Harbor Light': harborLight,
  'Dune Grass Way': duneGrassWay,
}
