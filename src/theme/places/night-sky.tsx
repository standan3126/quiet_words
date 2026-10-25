// The Night Sky's places: dusk by day, and every one has stars. The sun of the palette is
// the moon here.
import { H, heightAt, surface, W } from '../paint-kit'
import { aurora, bigOak, boat, campfire, colors, depth, glitter, grass, lantern, n, owl, pier, pine, scatter, shootingStar, tent, water, type Painter } from './kit'

const fireflyMeadow: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 450, 22)
  layer(p.layers[1], 520, 16)
  const mid = layer(p.layers[2], 600, 14)
  scatter(r, 100, mid, 120, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 8, 14 + r() * 10)).forEach(add)
  const near = layer(p.layers[3], 700, 12)
  scatter(r, 120, near, 110, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 12, 18 + r() * 20)).forEach(add)
  for (let i = 0; i < 60; i++) {
    const y = 470 + r() * 300
    const s = depth(y)
    const x = r() * W
    add(<circle cx={n(x)} cy={n(y)} r={n(5 * s)} fill={c('firefly')} opacity={0.25} />)
    add(<circle cx={n(x)} cy={n(y)} r={n(1.4 * s)} fill={c('firefly')} />)
  }
}

const moonlitLake: Painter = ({ p, r, night, add, layer, sun }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 470, 26)
  for (const [x, y] of far.tops) if (r() < 0.6) add(pine(x, y + 3, 0.5, p.layers[1], p.layers[1]))
  water(r, 490, p.layers[1], c('ripple')).forEach(add)
  glitter(r, sun.x, 492, 700, c('starlight')).forEach(add)
  const shore = layer(p.layers[3], 720, 10)
  for (let x = 0; x < W; x += 30 + r() * 30) if (x < 100 || x > 300) add(pine(x, heightAt(shore, x) + 6, 1.8 + r() * 0.6, p.layers[3], p.layers[3]))
}

const auroraField: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  aurora(r, 300, [c('aurora'), c('aurora2'), c('aurora')]).forEach(add)
  layer(p.layers[0], 460, 16)
  const field = layer(p.layers[1], 520, 10)
  scatter(r, 120, field, 280, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 8, 10 + r() * 10)).forEach(add)
  const near = layer(p.layers[3], 740, 8)
  scatter(r, 40, near, 60, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 10, 18)).forEach(add)
}

const starfallRidge: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  for (let i = 0; i < 6; i++) add(shootingStar(80 + r() * 300, 290 + r() * 150, 40 + r() * 60, c('starlight')))
  layer(p.layers[0], 470, 30)
  const ridge = layer(p.layers[1], 540, 50, true)
  for (const [x, y] of ridge.tops) if (r() < 0.35) add(pine(x, y + 4, 0.8, p.layers[2], p.layers[2]))
  layer(p.layers[2], 640, 20)
  layer(p.layers[3], 740, 10)
}

const campfireCove: Painter = ({ p, r, night, add }) => {
  const c = colors(night)
  water(r, 470, p.layers[1], c('ripple')).forEach(add)
  add(<path d={`M0,460 Q80,440 130,520 Q100,600 0,620 Z`} fill={p.layers[2]} />)
  add(<path d={`M${W},455 Q${W - 90},440 ${W - 140},520 Q${W - 110},600 ${W},630 Z`} fill={p.layers[2]} />)
  const beach = surface((x) => 620 + Math.sin(x / 60) * 6)
  add(<path d={beach.d} fill={p.layers[3]} />)
  const fx = 140 + r() * 120
  add(campfire(fx, 690, 2.2, c('fire'), c('fireCore'), c('glow'), c('bark')))
  add(<rect x={fx - 70} y={692} width={36} height={8} rx={4} fill={c('bark')} />)
  add(<rect x={fx + 36} y={696} width={36} height={8} rx={4} fill={c('bark')} />)
  for (let i = 0; i < 10; i++) add(<circle cx={n(fx + (r() - 0.5) * 30)} cy={n(640 - r() * 60)} r={1} fill={c('fireCore')} opacity={0.8} />)
}

const milkyWayCamp: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  // The Milky Way: a soft band across the sky, thick with tiny stars.
  add(<path d="M-20,460 Q200,330 420,250" stroke={c('starlight')} stroke-width={70} fill="none" opacity={0.12} stroke-linecap="round" />)
  add(<path d="M-20,460 Q200,330 420,250" stroke={c('starlight')} stroke-width={30} fill="none" opacity={0.12} stroke-linecap="round" />)
  for (let i = 0; i < 160; i++) {
    const t = r()
    const x = -20 + 440 * t
    const y = 460 - 210 * t + (1 - t) * t * -60 + (r() - 0.5) * 70
    add(<circle cx={n(x)} cy={n(y)} r={n(0.4 + r() * 0.9)} fill={c('starlight')} opacity={0.5 + r() * 0.5} />)
  }
  layer(p.layers[0], 480, 20)
  const camp = layer(p.layers[2], 600, 12)
  const tx = 120 + r() * 160
  add(tent(tx, heightAt(camp, tx) + 30, 2.4, c('tent'), c('dark')))
  add(campfire(tx + 80, heightAt(camp, tx) + 44, 1.2, c('fire'), c('fireCore'), c('glow'), c('bark')))
  layer(p.layers[3], 740, 8)
}

const lanternDock: Painter = ({ p, r, night, add }) => {
  const c = colors(night)
  water(r, 480, p.layers[1], c('ripple')).forEach(add)
  add(<path d={`M0,484 L0,474 Q100,464 200,472 T${W},468 L${W},484 Z`} fill={p.layers[2]} />)
  const dx = 150 + r() * 100
  const dock = pier([dx, 560], [dx + 30, H + 10], 40, 150, c('wood'), c('woodDark'))
  dock.parts.forEach(add)
  // Lanterns on posts along the dock, each with its light on the water.
  for (let i = 0; i < 4; i++) {
    const q = dock.edge(0.1 + i * 0.25)
    const s = depth(q.y)
    for (const side of [-1, 1]) {
      const x = q.x + side * (q.w / 2)
      add(<rect x={n(x - 1.2 * s)} y={n(q.y - 30 * s)} width={n(2.4 * s)} height={n(30 * s)} fill={c('woodDark')} />)
      add(lantern(x, q.y - 34 * s, s * 1.4, c('lantern'), c('dark')))
      add(<rect x={n(x - 4 * s)} y={n(q.y + 18 * s)} width={n(8 * s)} height={n(30 * s)} fill={c('lantern')} opacity={0.2} />)
    }
  }
}

const owlMoonWood: Painter = ({ p, r, night, add, layer, sun }) => {
  const c = colors(night)
  // A big moon low in the trees, an owl on a branch across it.
  add(<circle cx={sun.x} cy={sun.y + 20} r={70} fill={p.glow} opacity={0.9} />)
  const back = layer(p.layers[1], 520, 12)
  for (let x = 0; x < W; x += 22 + r() * 16) add(pine(x, heightAt(back, x) + 4, 1.2 + r() * 0.6, p.layers[2], p.layers[2]))
  const near = layer(p.layers[3], 660, 10)
  for (const x of [20 + r() * 30, 360 + r() * 30]) add(bigOak(x, heightAt(near, x) + 6, 1.8, p.layers[3], p.layers[3], p.layers[3]))
  const by = sun.y + 70
  const fromLeft = sun.x > 200
  add(<path d={fromLeft ? `M0,${by + 40} Q${sun.x - 60},${by} ${sun.x + 60},${by + 4} L${sun.x + 60},${by + 9} Q${sun.x - 60},${by + 8} 0,${by + 52} Z` : `M${W},${by + 40} Q${sun.x + 60},${by} ${sun.x - 60},${by + 4} L${sun.x - 60},${by + 9} Q${sun.x + 60},${by + 8} ${W},${by + 52} Z`} fill={p.layers[3]} />)
  add(owl(sun.x, by + 4, 3.2, p.layers[3], p.layers[2], c('eye')))
}

const cometHill: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const cx = 250 + r() * 80
  const cy = 330 + r() * 40
  add(<path d={`M${cx},${cy} Q${cx - 120},${cy - 40} ${cx - 240},${cy - 120}`} stroke={c('starlight')} stroke-width={14} fill="none" opacity={0.15} stroke-linecap="round" />)
  add(<path d={`M${cx},${cy} Q${cx - 110},${cy - 34} ${cx - 220},${cy - 110}`} stroke={c('starlight')} stroke-width={5} fill="none" opacity={0.35} stroke-linecap="round" />)
  add(<circle cx={cx} cy={cy} r={6} fill={c('starlight')} opacity={0.4} />)
  add(<circle cx={cx} cy={cy} r={3} fill={c('starlight')} />)
  layer(p.layers[0], 480, 18)
  const hx = 120 + r() * 160
  const hill = surface((x) => 620 - 140 * Math.exp(-(((x - hx) / 130) ** 2)) + Math.sin(x / 33) * 3)
  add(<path d={hill.d} fill={p.layers[2]} />)
  add(pine(hx + 20, heightAt(hill, hx + 20) + 4, 1.2, p.layers[3], p.layers[3]))
  layer(p.layers[3], 730, 10)
}

const twilightPier: Painter = ({ p, r, night, add, sun }) => {
  const c = colors(night)
  water(r, 470, p.layers[1], c('ripple')).forEach(add)
  glitter(r, sun.x, 472, 640, c('starlight')).forEach(add)
  const x = 160 + r() * 80
  const long = pier([x, 500], [x - 20, H + 10], 10, 120, c('wood'), c('woodDark'))
  long.parts.forEach(add)
  const end = long.edge(0)
  add(lantern(end.x, end.y - 16, 0.8, c('lantern'), c('dark')))
}

const quietHarbor: Painter = ({ p, r, night, add }) => {
  const c = colors(night)
  // A little town along the far shore with lit windows, and boats asleep on calm water.
  const town = surface((x) => 480 + Math.sin(x / 50) * 4)
  add(<path d={town.d} fill={p.layers[2]} />)
  for (let x = 10; x < W; x += 24 + r() * 14) {
    const w = 16 + r() * 8
    const h = 14 + r() * 14
    const y = heightAt(town, x) + 2
    add(<path d={`M${n(x)},${n(y)} L${n(x)},${n(y - h)} L${n(x + w / 2)},${n(y - h - 8)} L${n(x + w)},${n(y - h)} L${n(x + w)},${n(y)} Z`} fill={p.layers[3]} />)
    if (r() < 0.7) add(<rect x={n(x + w / 2 - 2)} y={n(y - h + 4)} width={4} height={4} fill={c('lantern')} />)
  }
  water(r, 490, p.layers[1], c('ripple')).forEach(add)
  for (let i = 0; i < 5; i++) {
    const y = 540 + i * 40 + r() * 20
    const bx = 40 + r() * 320
    const s = depth(y) * 1.4
    add(boat(bx, y, s, i % 2 ? c('hull') : c('hullRed'), c('dark'), c('sail'), c('woodDark')))
    add(<path d={`M${n(bx - 14 * s)},${n(y + 3 * s)} L${n(bx + 14 * s)},${n(y + 3 * s)}`} stroke={c('ripple')} stroke-width={1} opacity={0.6} />)
  }
  const quay = surface((x) => 760 + Math.sin(x / 70) * 2)
  add(<path d={quay.d} fill={p.layers[3]} />)
}

export const NIGHT_SKY: Record<string, Painter> = {
  'Firefly Meadow': fireflyMeadow,
  'Moonlit Lake': moonlitLake,
  'Aurora Field': auroraField,
  'Starfall Ridge': starfallRidge,
  'Campfire Cove': campfireCove,
  'Milky Way Camp': milkyWayCamp,
  'Lantern Dock': lanternDock,
  'Owl Moon Wood': owlMoonWood,
  'Comet Hill': cometHill,
  'Twilight Pier': twilightPier,
  'Quiet Harbor': quietHarbor,
}
