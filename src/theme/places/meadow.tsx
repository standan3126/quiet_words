// The Meadow's places.
import { heightAt, surface, W } from '../paint-kit'
import { bale, bee, bloom, n, bluebell, buttercup, clover, cloverHead, colors, daisy, dandelion, depth, gate, grass, lark, poppy, puff, ribbon, roundTree, scatter, seedling, skep, willow, type Color, type Painter } from './kit'

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

export const MEADOW: Record<string, Painter> = {
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
