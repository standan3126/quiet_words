// The Mountain's places.
import { H, heightAt, surface, W } from '../paint-kit'
import { colors, depth, eagle, edelweiss, glitter, grass, marmot, mist, n, pine, scatter, snowcaps, bloom, type Painter } from './kit'

// A big mountain with a sharp summit at (x, top), as a ground shape.
const peak = (x: number, top: number, base: number, width: number, wobble: number) =>
  surface((px) => {
    const d = Math.abs(px - x) / width
    return Math.min(base, top + (base - top) * d ** 0.9) + Math.sin(px / 9) * wobble
  })

const alpineLake: Painter = ({ p, r, night, add, layer, sun }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 420, 70, true)
  snowcaps(far, 420, c('snow')).forEach(add)
  const mid = layer(p.layers[1], 480, 40, true)
  snowcaps(mid, 460, c('snow')).forEach(add)
  add(<rect x={0} y={500} width={W} height={120} fill={c('water')} />)
  glitter(r, sun.x, 502, 600, c('ripple')).forEach(add)
  const shore = layer(p.layers[2], 640, 14)
  for (let x = 0; x < W; x += 14 + r() * 26) if (x < 120 || x > 280) add(pine(x, heightAt(shore, x) + 4, 1.1 + r() * 0.6, p.layers[3], c('bark')))
  const near = layer(p.layers[3], 740, 10)
  scatter(r, 40, near, 60, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 8, 14)).forEach(add)
}

const glacierPass: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 430, 40, true)
  const lx = 80 + r() * 40
  const rx = 280 + r() * 40
  const left = peak(lx, 360, 620, 160, 3)
  add(<path d={left.d} fill={p.layers[1]} />)
  snowcaps(left, 420, c('snow')).forEach(add)
  const right = peak(rx, 350, 620, 160, 3)
  add(<path d={right.d} fill={p.layers[1]} />)
  snowcaps(right, 420, c('snow')).forEach(add)
  // The glacier fills the pass between them and spills down toward us.
  const mid = (lx + rx) / 2
  add(<path d={`M${mid - 30},470 Q${mid},455 ${mid + 30},470 L${mid + 110},700 Q${mid},720 ${mid - 110},700 Z`} fill={c('ice')} />)
  for (let i = 0; i < 7; i++) {
    const y = 490 + i * 30
    const w = 30 + i * 12
    add(<path d={`M${mid - w},${y} q${w},6 ${w * 2},0`} stroke={c('snow')} stroke-width={1.4} fill="none" opacity={0.8} />)
  }
  const near = layer(p.layers[2], 700, 16)
  scatter(r, 30, near, 100, (x, y, s) => <ellipse cx={n(x)} cy={n(y)} rx={n(12 * s)} ry={n(7 * s)} fill={c('granite')} />).forEach(add)
  layer(p.layers[3], 770, 8)
}

const eagleCrest: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 440, 55, true)
  snowcaps(far, 440, c('snow')).forEach(add)
  layer(p.layers[1], 520, 40, true)
  // A rocky crest rising to one side, eagles circling above the valley.
  const left = r() < 0.5
  const crest = surface((x) => {
    const t = (left ? W - x : x) / W
    return 640 - 230 * t ** 1.8 + Math.sin(x / 11) * 5
  })
  add(<path d={crest.d} fill={p.layers[2]} />)
  add(<path d={surface((x) => heightAt(crest, x) + 60 + Math.sin(x / 15) * 6).d} fill={p.layers[3]} />)
  const big = left ? 120 + r() * 60 : 220 + r() * 60
  add(eagle(big, 420 + r() * 30, 3, c('eagle')))
  for (let i = 0; i < 2; i++) add(eagle(60 + r() * 280, 320 + r() * 80, 1.2 + r() * 0.6, c('eagle')))
}

const summitMeadow: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const summit = peak(140 + r() * 120, 340, 520, 200, 4)
  add(<path d={summit.d} fill={p.layers[0]} />)
  snowcaps(summit, 440, c('snow')).forEach(add)
  const meadow = layer(p.layers[2], 540, 16)
  const mix = [c('yellow'), c('violet'), c('white'), c('pink')]
  scatter(r, 360, meadow, 260, (x, y, s) => bloom(x, y, s, mix[Math.floor(r() * 4)], c('stem'), 6 + r() * 8)).forEach(add)
  scatter(r, 100, meadow, 260, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 10 + r() * 8)).forEach(add)
}

const snowmeltFalls: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 430, 60, true)
  snowcaps(far, 430, c('snow')).forEach(add)
  // A cliff with the falls pouring over its lip into a pool.
  const fx = 150 + r() * 100
  add(<path d={`M0,${H} L0,460 Q${fx - 60},450 ${fx - 14},470 L${fx + 14},470 Q${fx + 60},455 ${W},465 L${W},${H} Z`} fill={p.layers[1]} />)
  add(<path d={`M${fx - 14},470 L${fx + 14},470 L${fx + 24},640 L${fx - 24},640 Z`} fill={c('falls')} />)
  for (let i = 0; i < 6; i++) add(<path d={`M${fx - 10 + i * 4},475 L${fx - 18 + i * 7},636`} stroke={c('ripple')} stroke-width={1} opacity={0.7} />)
  add(<ellipse cx={fx} cy={660} rx={120} ry={26} fill={c('water')} />)
  add(mist(fx, 640, 120, 30, c('mist'), 0.55))
  const near = surface((x) => 690 + Math.sin(x / 40) * 6 + Math.abs(x - fx) * 0.05)
  add(<path d={`${near.d}`} fill={p.layers[3]} />)
  for (let x = 0; x < W; x += 20 + r() * 20) if (Math.abs(x - fx) > 110) add(pine(x, heightAt(near, x) + 4, 1.4 + r() * 0.5, p.layers[2], c('bark')))
}

const graniteRidge: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 440, 50, true)
  snowcaps(far, 440, c('snow')).forEach(add)
  layer(p.layers[1], 520, 30)
  // Blocky granite slabs stacked along the ridge.
  for (let i = 0; i < 16; i++) {
    const x = (i / 15) * W + (r() - 0.5) * 20
    const y = 560 + Math.sin(i * 0.7) * 20 + r() * 20
    const w = 40 + r() * 40
    const h = 30 + r() * 50
    add(<path d={`M${n(x - w / 2)},${n(y + 40)} L${n(x - w / 2 + 6)},${n(y - h + 10)} L${n(x + 4)},${n(y - h)} L${n(x + w / 2)},${n(y - h + 18)} L${n(x + w / 2)},${n(y + 40)} Z`} fill={r() < 0.5 ? c('granite') : c('graniteDark')} />)
    add(<path d={`M${n(x - w / 2 + 6)},${n(y - h + 10)} L${n(x + 4)},${n(y - h)} L${n(x + 2)},${n(y - h + 14)} Z`} fill={c('rockLight')} />)
  }
  const near = layer(p.layers[3], 700, 12)
  scatter(r, 40, near, 100, (x, y, s) => <ellipse cx={n(x)} cy={n(y)} rx={n(10 * s)} ry={n(6 * s)} fill={c('granite')} />).forEach(add)
}

const edelweissSlope: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 430, 60, true)
  snowcaps(far, 430, c('snow')).forEach(add)
  const flip = r() < 0.5
  const slope = surface((x) => 470 + 200 * ((flip ? W - x : x) / W) ** 1.2 + Math.sin(x / 25) * 4)
  add(<path d={slope.d} fill={p.layers[2]} />)
  scatter(r, 30, slope, 400, (x, y, s) => <ellipse cx={n(x)} cy={n(y)} rx={n(9 * s)} ry={n(5 * s)} fill={c('granite')} />).forEach(add)
  scatter(r, 90, slope, 400, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 8 + r() * 8)).forEach(add)
  scatter(r, 220, slope, 400, (x, y, s) => edelweiss(x, y, s * 1.2, c('white'), c('yellow'), c('stem'))).forEach(add)
}

const cloudlineTrail: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 410, 70, true)
  snowcaps(far, 410, c('snow')).forEach(add)
  // A band of cloud wrapped around the mountains' middle.
  for (let i = 0; i < 10; i++) add(mist(r() * W, 450 + r() * 30, 120 + r() * 120, 26 + r() * 14, c('mist'), 0.7))
  const slope = layer(p.layers[2], 540, 20)
  // The trail zigzags up the slope toward the clouds.
  const top = 545
  let d = `M${160 + r() * 80},${H}`
  for (let i = 0, y = H, dir = 1; y > top; i++, dir = -dir) {
    y -= Math.max(12, 30 - i * 1.5)
    d += ` L${n(200 + dir * (110 - (H - y) * 0.25))},${n(Math.max(y, top))}`
  }
  add(<path d={d} stroke={c('path')} stroke-width={5} fill="none" stroke-linejoin="round" stroke-linecap="round" />)
  scatter(r, 60, slope, 260, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 10)).forEach(add)
  for (let i = 0; i < 4; i++) add(mist(r() * W, 470 + r() * 40, 200 + r() * 100, 22, c('mist'), 0.5))
}

const marmotBasin: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 430, 60, true)
  snowcaps(far, 430, c('snow')).forEach(add)
  layer(p.layers[1], 500, 20)
  const basin = surface((x) => 540 + 50 * Math.sin((Math.PI * x) / W) + Math.sin(x / 37) * 3)
  add(<path d={basin.d} fill={p.layers[2]} />)
  scatter(r, 70, basin, 260, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 6, 8)).forEach(add)
  // Boulders, with marmots sitting up on a few of them.
  const rocks: [number, number][] = Array.from({ length: 9 }, () => [r() * W, 560 + r() * 200])
  rocks.sort((a, b) => a[1] - b[1]).forEach(([x, y], i) => {
    const s = depth(y)
    add(<ellipse cx={n(x)} cy={n(y)} rx={n(26 * s)} ry={n(15 * s)} fill={c('granite')} />)
    add(<ellipse cx={n(x - 6 * s)} cy={n(y - 6 * s)} rx={n(12 * s)} ry={n(5 * s)} fill={c('rockLight')} />)
    if (i % 3 === 1) add(marmot(x, y - 12 * s, s * 3.2, c('marmot'), c('dark')))
  })
}

const larchValley: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 430, 60, true)
  snowcaps(far, 430, c('snow')).forEach(add)
  const left = surface((x) => 440 + 200 * (x / W) ** 1.5 + Math.sin(x / 20) * 3)
  add(<path d={left.d} fill={p.layers[1]} />)
  const right = surface((x) => 450 + 200 * ((W - x) / W) ** 1.5 + Math.sin(x / 22) * 3)
  add(<path d={right.d} fill={p.layers[2]} />)
  // Golden larches up both sides of the valley, bigger near the bottom.
  const trees: [number, number][] = []
  for (let i = 0; i < 70; i++) {
    const x = r() * W
    const top = x < W / 2 ? heightAt(left, x) : heightAt(right, x)
    trees.push([x, top + 6 + r() * 80])
  }
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => add(pine(x, y, depth(y) * 1.3, r() < 0.8 ? c('larch') : c('mapleGold'), c('bark'))))
  const floor = layer(p.layers[3], 720, 10)
  scatter(r, 40, floor, 80, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 6, 12)).forEach(add)
}

const echoPeak: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const x = 140 + r() * 120
  // Fainter copies of the peak behind it, like its echo.
  for (const [dx, top, op] of [[-120, 400, 0.45], [130, 410, 0.45], [-60, 380, 0.7], [70, 385, 0.7]] as const) {
    const echo = peak(x + dx, top, 560, 150, 2)
    add(<path d={echo.d} fill={p.layers[0]} opacity={op} />)
  }
  const main = peak(x, 320, 600, 170, 3)
  add(<path d={main.d} fill={p.layers[1]} />)
  snowcaps(main, 420, c('snow')).forEach(add)
  const near = layer(p.layers[2], 620, 16)
  for (let i = 0; i < 26; i++) {
    const px = r() * W
    add(pine(px, heightAt(near, px) + 6 + r() * 30, 1 + r() * 0.5, p.layers[3], c('bark')))
  }
  layer(p.layers[3], 740, 10)
}

export const MOUNTAIN: Record<string, Painter> = {
  'Alpine Lake': alpineLake,
  'Glacier Pass': glacierPass,
  'Eagle Crest': eagleCrest,
  'Summit Meadow': summitMeadow,
  'Snowmelt Falls': snowmeltFalls,
  'Granite Ridge': graniteRidge,
  'Edelweiss Slope': edelweissSlope,
  'Cloudline Trail': cloudlineTrail,
  'Marmot Basin': marmotBasin,
  'Larch Valley': larchValley,
  'Echo Peak': echoPeak,
}
