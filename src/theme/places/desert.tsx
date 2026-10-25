// The Desert's places.
import { H, heightAt, surface, W } from '../paint-kit'
import { colors, depth, n, palm, pricklyPear, ribbon, saguaro, scatter, shrub, type Painter } from './kit'

// A flat-topped mesa standing on the ground line.
const mesa = (x: number, base: number, w: number, h: number, fill: string) => <path d={`M${n(x - w / 2 - 14)},${n(base)} L${n(x - w / 2)},${n(base - h)} L${n(x + w / 2)},${n(base - h)} L${n(x + w / 2 + 16)},${n(base)} Z`} fill={fill} />

const sandstoneArch: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 14)
  const x = 140 + r() * 120
  add(<path fill-rule="evenodd" d={`M${x - 95},640 L${x - 82},440 Q${x - 70},395 ${x},392 Q${x + 70},395 ${x + 84},440 L${x + 98},640 Z M${x - 50},640 L${x - 46},500 Q${x},445 ${x + 46},500 L${x + 52},640 Z`} fill={c('sandstone')} />)
  add(<path d={`M${x - 82},440 Q${x - 70},395 ${x},392 Q${x + 70},395 ${x + 84},440 Q${x},412 ${x - 82},440 Z`} fill={c('sandstoneDark')} />)
  const floor = layer(p.layers[1], 620, 10)
  scatter(r, 20, floor, 160, (x2, y, s) => shrub(x2, y, s * 1.4, c('juniper'))).forEach(add)
  layer(p.layers[3], 750, 8)
}

const mesaSunset: Painter = ({ p, r, night, add, layer, sun }) => {
  const c = colors(night)
  // A warm band low in the sky, the sun sinking behind the mesas.
  add(<rect x={0} y={sun.y - 40} width={W} height={120} fill={c('glow')} opacity={0.35} />)
  add(<circle cx={sun.x} cy={sun.y + 40} r={50} fill={c('fire')} opacity={0.5} />)
  for (let i = 0; i < 4; i++) add(mesa(20 + i * 110 + r() * 40, 500, 60 + r() * 60, 40 + r() * 60, p.layers[3]))
  layer(p.layers[3], 500, 4)
  const near = layer(p.layers[2], 620, 14)
  scatter(r, 14, near, 150, (x, y, s) => saguaro(x, y, s * 0.9, c('cactusDark'), c('cactusDark'))).forEach(add)
}

const saguaroFlats: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 18)
  const flats = surface((x) => 500 + Math.sin(x / 80) * 3)
  add(<path d={flats.d} fill={p.layers[1]} />)
  scatter(r, 26, flats, 300, (x, y, s) => saguaro(x, y, s * 1.2, c('cactus'), c('cactusDark'))).forEach(add)
  scatter(r, 40, flats, 300, (x, y, s) => shrub(x, y, s * 0.9, c('juniper'))).forEach(add)
}

const redCanyon: Painter = ({ r, night, add }) => {
  const c = colors(night)
  // Layered red walls stepping down to a river at the bottom.
  const river = ribbon([190 + r() * 20, 500], 200, 50, 150)
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const inset = 110 - k * 26
      const top = 410 + k * 40
      const fill = k % 2 ? c('canyon') : c('canyonDark')
      const pts: string[] = []
      for (let t = 0; t <= 1.0001; t += 0.05) {
        const q = river.mid(t)
        pts.push(`${n(q.x + side * (q.w / 2 + inset * (1 - t * 0.6) + 10))},${n(Math.max(top, q.y))}`)
      }
      const edgeX = side < 0 ? 0 : W
      add(<path d={`M${edgeX},${top} L${pts.join(' L')} L${edgeX},${H} Z`} fill={fill} />)
    }
  }
  add(<path d={river.d} fill={c('water')} />)
  for (let i = 0; i < 6; i++) {
    const q = river.mid(0.2 + i * 0.14)
    add(<path d={`M${n(q.x - q.w * 0.2)},${n(q.y)} q${n(q.w * 0.1)},-2 ${n(q.w * 0.2)},0`} stroke={c('ripple')} stroke-width={1} fill="none" />)
  }
}

const oasisSpring: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 30)
  const sand = layer(p.layers[1], 540, 20)
  const x = 140 + r() * 120
  add(<ellipse cx={x} cy={620} rx={140} ry={34} fill={c('leafLight')} />)
  add(<ellipse cx={x} cy={622} rx={110} ry={24} fill={c('water')} />)
  add(<ellipse cx={x - 20} cy={616} rx={50} ry={5} fill={c('ripple')} opacity={0.6} />)
  for (const [dx, dy, s] of [[-110, 610, 2], [-70, 600, 1.6], [90, 604, 1.8], [125, 618, 2.3], [20, 590, 1.3]]) add(palm(x + dx, dy, s, c('bark'), c('palm')))
  scatter(r, 30, sand, 260, (x2, y, s) => (Math.abs(x2 - x) > 150 ? shrub(x2, y, s, c('juniper')) : <g />)).forEach(add)
}

const duneSea: Painter = ({ p, r, add }) => {
  // Dune after dune to the horizon, each with ripples in the sand.
  for (let k = 0; k < 6; k++) {
    const base = 470 + k * 55
    const ph = r() * 6
    const dune = surface((x) => base + Math.sin(x / (70 + k * 10) + ph) * (10 + k * 4))
    add(<path d={dune.d} fill={p.layers[k % 4]} />)
    for (let i = 0; i < 3 + k; i++) {
      const x = r() * W
      const y = heightAt(dune, x) + 6 + r() * 30
      add(<path d={`M${n(x)},${n(y)} q${n(16 * depth(y))},-3 ${n(34 * depth(y))},0`} stroke={p.layers[(k + 2) % 4]} stroke-width={1} fill="none" opacity={0.7} />)
    }
  }
}

const juniperWash: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 24)
  const ground = layer(p.layers[2], 520, 12)
  const wash = ribbon([160 + r() * 80, 524], 210, 90, 200)
  add(<path d={wash.d} fill={c('sand')} />)
  for (let i = 0; i < 30; i++) {
    const q = wash.mid(r())
    add(<ellipse cx={n(q.x + (r() - 0.5) * q.w * 0.8)} cy={n(q.y)} rx={n(3 * depth(q.y))} ry={n(2 * depth(q.y))} fill={c('pebble')} />)
  }
  scatter(r, 40, ground, 280, (x, y, s) => shrub(x, y, s * (1.4 + r()), c('juniper'))).forEach(add)
}

const paintedHills: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const bands = [c('band1'), c('band2'), c('band3'), c('band4')]
  layer(p.layers[0], 470, 14)
  // Round hills striped in bands of colour.
  for (let k = 0; k < 4; k++) {
    const hx = 40 + k * 110 + r() * 40
    const top = 430 + k * 30 + r() * 30
    const w = 120 + r() * 40
    const base = 660
    for (let b = 0; b < 6; b++) {
      const t = top + ((base - top) * b) / 6
      const rw = w * (1 - b * 0.1)
      // The control point sits twice as high as the band's top, so the curve peaks at it.
      add(<path d={`M${n(hx - rw)},${base} Q${n(hx)},${n(2 * t - base)} ${n(hx + rw)},${base} Z`} fill={bands[(b + k) % 4]} />)
    }
  }
  layer(p.layers[1], 640, 8)
  layer(p.layers[3], 750, 6)
}

const cactusBloom: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 24)
  const ground = layer(p.layers[1], 530, 12)
  scatter(r, 50, ground, 280, (x, y, s) => (r() < 0.75 ? pricklyPear(x, y, s * 1.4, c('cactus'), c('cactusFlower')) : saguaro(x, y, s, c('cactus'), c('cactusDark')))).forEach(add)
  const near = layer(p.layers[2], 740, 8)
  scatter(r, 6, near, 40, (x, y, s) => pricklyPear(x, y, s * 2, c('cactus'), c('cactusFlower'))).forEach(add)
}

const copperBluff: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 470, 18)
  // A tall copper-coloured bluff with streaks down its face.
  const left = r() < 0.5
  const edge = left ? 250 : 150
  const face = left ? `M0,${H} L0,380 L${edge - 30},385 Q${edge},395 ${edge + 10},440 L${edge + 30},640 L${edge + 50},${H} Z` : `M${W},${H} L${W},380 L${edge + 30},385 Q${edge},395 ${edge - 10},440 L${edge - 30},640 L${edge - 50},${H} Z`
  add(<path d={face} fill={c('copper')} />)
  for (let i = 0; i < 8; i++) {
    const x = left ? 20 + i * 28 : W - 20 - i * 28
    add(<path d={`M${x},${390 + r() * 10} L${x + (r() - 0.5) * 10},${600 + r() * 60}`} stroke={c('sandstoneDark')} stroke-width={2 + r() * 2} opacity={0.6} />)
  }
  add(<path d={left ? `M0,380 L${edge - 30},385 Q${edge},395 ${edge + 6},410 L0,400 Z` : `M${W},380 L${edge + 30},385 Q${edge},395 ${edge - 6},410 L${W},400 Z`} fill={c('sandstoneDark')} />)
  const floor = layer(p.layers[1], 640, 10)
  scatter(r, 16, floor, 140, (x, y, s) => shrub(x, y, s * 1.3, c('juniper')), left ? edge : 0, left ? W : edge).forEach(add)
}

const mirageBasin: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const x = 100 + r() * 200
  add(mesa(x, 490, 120, 50, p.layers[0]))
  const basin = surface(() => 490)
  add(<path d={basin.d} fill={p.layers[1]} />)
  // The mirage: a shimmering, upside-down copy of the mesa on the flat ground.
  add(<g opacity={0.35} transform={`translate(0,980) scale(1,-1)`}>{mesa(x, 490, 120, 40, p.layers[0])}</g>)
  for (let i = 0; i < 12; i++) {
    const y = 494 + i * 5
    add(<path d={`M${n(x - 120 + r() * 30)},${y} L${n(x + 120 - r() * 30)},${y}`} stroke={c('ripple')} stroke-width={1.2} opacity={0.6} />)
  }
  layer(p.layers[2], 640, 6)
  const near = layer(p.layers[3], 740, 6)
  scatter(r, 10, near, 50, (x2, y, s) => shrub(x2, y, s, c('juniper'))).forEach(add)
}

export const DESERT: Record<string, Painter> = {
  'Sandstone Arch': sandstoneArch,
  'Mesa Sunset': mesaSunset,
  'Saguaro Flats': saguaroFlats,
  'Red Canyon': redCanyon,
  'Oasis Spring': oasisSpring,
  'Dune Sea': duneSea,
  'Juniper Wash': juniperWash,
  'Painted Hills': paintedHills,
  'Cactus Bloom': cactusBloom,
  'Copper Bluff': copperBluff,
  'Mirage Basin': mirageBasin,
}
