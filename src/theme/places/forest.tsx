// The Forest's places.
import { heightAt, surface, W } from '../paint-kit'
import { acorn, bigOak, birch, cedar, colors, depth, fern, grass, mist, mushroom, n, owl, pine, ribbon, roundTree, scatter, shrub, type Painter } from './kit'

const fernHollow: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 24)
  const rim = surface((x) => 470 + 70 * Math.sin((Math.PI * x) / W) + Math.sin(x / 31) * 3)
  add(<path d={rim.d} fill={p.layers[1]} />)
  for (let x = 5; x < W; x += 30 + r() * 30) if (x < 110 || x > 290) add(pine(x, heightAt(rim, x) + 6, 0.9 + r() * 0.5, p.layers[3], c('bark')))
  const bowl = surface((x) => 500 + 115 * Math.sin((Math.PI * x) / W) + Math.sin(x / 27) * 3)
  add(<path d={bowl.d} fill={p.layers[2]} />)
  scatter(r, 170, bowl, 320, (x, y, s) => fern(x, y, s * 1.3, r() < 0.5 ? c('fern') : p.layers[3])).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 14, near, 50, (x, y, s) => fern(x, y, s * 1.5, c('fern'))).forEach(add)
}

const mossyPath: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 440, 22)
  const floor = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 22 + r() * 16) add(pine(x, heightAt(floor, x) + 4, 1 + r() * 0.5, p.layers[2], c('bark')))
  const ground = surface((x) => heightAt(floor, x) + 8)
  add(<path d={ground.d} fill={p.layers[2]} />)
  const path = ribbon([180 + r() * 40, 510], 200, 60, 170)
  add(<path d={path.d} fill={c('moss')} opacity={0.9} />)
  // Mossy stones and mounds along both edges.
  for (const side of [-1, 1]) {
    for (let i = 3; i <= 40; i++) {
      const q = path.mid(i / 40)
      const s = depth(q.y)
      const x = q.x + side * (q.w / 2 + (4 + r() * 10) * s)
      add(<ellipse cx={n(x)} cy={n(q.y)} rx={n((6 + r() * 6) * s)} ry={n((3 + r() * 3) * s)} fill={r() < 0.5 ? c('moss') : p.layers[3]} />)
      if (r() < 0.25) add(fern(x + side * 10 * s, q.y, s, c('fern')))
    }
  }
  for (let i = 0; i < 4; i++) {
    const q = path.mid(0.3 + r() * 0.6)
    add(mushroom(q.x + (r() < 0.5 ? -1 : 1) * (q.w / 2 + 8), q.y, depth(q.y) * 1.4, c('mushroom'), c('birch')))
  }
}

const cedarGrove: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 490, 12)
  for (let x = 0; x < W; x += 26 + r() * 20) add(cedar(x, heightAt(back, x) + 4, 0.7 + r() * 0.3, p.layers[2], c('bark')))
  const mid = layer(p.layers[2], 560, 14)
  for (let x = -10; x < W + 10; x += 50 + r() * 40) add(cedar(x, heightAt(mid, Math.max(0, Math.min(W, x))) + 6, 1.3 + r() * 0.4, p.layers[3], c('bark')))
  const near = layer(p.layers[3], 700, 12)
  scatter(r, 60, near, 100, (x, y, s) => grass(x, y, s, p.layers[1], (r() - 0.5) * 8, 14 + r() * 10)).forEach(add)
  const big = 60 + r() * 280
  add(cedar(big, heightAt(near, big) + 12, 2.6, c('pine'), c('bark')))
}

const birchGlade: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 16 + r() * 14) add(birch(x, heightAt(back, x) + 4, 0.7 + r() * 0.3, c('birch'), c('birchMark'), p.layers[2]))
  const glade = surface((x) => 530 + Math.sin(x / 47) * 5)
  add(<path d={glade.d} fill={p.layers[2]} />)
  scatter(r, 120, glade, 260, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 8, 10 + r() * 10)).forEach(add)
  scatter(r, 40, glade, 260, (x, y, s) => grass(x, y, s * 0.5, c('mapleGold'), 0, 6)).forEach(add)
  // Tall birches framing both sides.
  for (const x of [20 + r() * 30, 60 + r() * 30, 310 + r() * 30, 360 + r() * 30]) add(birch(x, 720 + r() * 40, 2.2 + r() * 0.5, c('birch'), c('birchMark'), p.layers[3]))
}

const owlWood: Painter = ({ p, r, night, add, layer, sun }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 24 + r() * 20) add(roundTree(x, heightAt(back, x) + 6, 1 + r() * 0.5, p.layers[2], c('bark')))
  const near = layer(p.layers[3], 640, 10)
  for (let x = 10; x < W; x += 60 + r() * 50) add(bigOak(x, heightAt(near, x) + 10, 1.1 + r() * 0.3, p.layers[2], p.layers[3], c('bark')))
  // A low branch across the front with an owl on it, the moon (or sun) behind.
  const by = 560 + r() * 30
  const side = sun.x < 200 ? -1 : 1
  add(<path d={side < 0 ? `M${W},${by + 30} Q250,${by} 60,${by + 6} L60,${by + 16} Q250,${by + 14} ${W},${by + 50} Z` : `M0,${by + 30} Q150,${by} 340,${by + 6} L340,${by + 16} Q150,${by + 14} 0,${by + 50} Z`} fill={c('bark')} />)
  const ox = side < 0 ? 140 : 260
  add(owl(ox, by + 6, 5.5, c('owl'), c('owlFace'), c('eye')))
  scatter(r, 50, near, 120, (x, y, s) => fern(x, y, s, c('fern'))).forEach(add)
}

const pineRidge: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const far = layer(p.layers[0], 440, 40)
  for (const [x, y] of far.tops) if (r() < 0.5) add(pine(x, y + 3, 0.45, p.layers[1], p.layers[1]))
  const mid = layer(p.layers[1], 520, 45)
  for (const [x, y] of mid.tops) if (r() < 0.6) add(pine(x, y + 4, 0.8 + r() * 0.3, p.layers[2], p.layers[2]))
  const near = layer(p.layers[2], 630, 35)
  for (const [x, y] of near.tops) if (r() < 0.6) add(pine(x, y + 6, 1.3 + r() * 0.4, p.layers[3], c('bark')))
  const front = layer(p.layers[3], 740, 14)
  scatter(r, 40, front, 60, (x, y, s) => grass(x, y, s, p.layers[2], (r() - 0.5) * 8, 14)).forEach(add)
}

const mapleTrail: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  const autumn = [c('maple'), c('mapleGold'), c('maple')]
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 22 + r() * 16) add(roundTree(x, heightAt(back, x) + 6, 0.8 + r() * 0.4, autumn[Math.floor(r() * 3)], c('bark')))
  const ground = surface((x) => heightAt(back, x) + 10)
  add(<path d={ground.d} fill={p.layers[2]} />)
  const trail = ribbon([190 + r() * 30, 512], 220, 70, 170)
  add(<path d={trail.d} fill={c('path')} />)
  // Maples along both sides, getting bigger toward us, and leaves on the trail.
  for (const side of [-1, 1]) {
    for (let t = 0.15; t <= 1; t += 0.17) {
      const q = trail.mid(t)
      const s = depth(q.y)
      add(roundTree(q.x + side * (q.w / 2 + 34 * s), q.y + 4, s * 1.7, autumn[Math.floor(r() * 3)], c('bark')))
    }
  }
  for (let i = 0; i < 60; i++) {
    const q = trail.mid(0.2 + r() * 0.8)
    const s = depth(q.y)
    add(<ellipse cx={n(q.x + (r() - 0.5) * q.w)} cy={n(q.y + (r() - 0.5) * 8)} rx={n(2.2 * s)} ry={n(1.4 * s)} fill={autumn[Math.floor(r() * 3)]} />)
  }
}

const acornDell: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  layer(p.layers[1], 495, 14)
  const dell = surface((x) => 520 + 70 * Math.sin((Math.PI * x) / W) + Math.sin(x / 29) * 3)
  add(<path d={dell.d} fill={p.layers[2]} />)
  const ox = 120 + r() * 160
  add(bigOak(ox, heightAt(dell, ox) + 30, 2.4, p.layers[3], c('pine'), c('bark')))
  scatter(r, 110, dell, 260, (x, y, s) => acorn(x, y, s * 1.4, c('acorn'), c('acornCap'))).forEach(add)
  scatter(r, 14, dell, 260, (x, y, s) => mushroom(x, y, s * 1.3, c('mushroom'), c('birch'))).forEach(add)
  const near = layer(p.layers[3], 750, 10)
  scatter(r, 16, near, 50, (x, y, s) => acorn(x, y, s * 1.6, c('acorn'), c('acornCap'))).forEach(add)
}

const mistyThicket: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 14 + r() * 12) add(pine(x, heightAt(back, x) + 4, 0.8 + r() * 0.5, p.layers[2], p.layers[2]))
  for (let i = 0; i < 8; i++) add(mist(r() * W, 480 + r() * 40, 200 + r() * 200, 18 + r() * 14, c('mist'), 0.18))
  const mid = layer(p.layers[2], 580, 12)
  scatter(r, 60, mid, 40, (x, y, s) => shrub(x, y, s * 2.2, r() < 0.5 ? p.layers[3] : p.layers[1])).forEach(add)
  for (let i = 0; i < 7; i++) add(mist(r() * W, 590 + r() * 50, 220 + r() * 200, 22 + r() * 18, c('mist'), 0.16))
  const near = layer(p.layers[3], 700, 12)
  scatter(r, 40, near, 100, (x, y, s) => shrub(x, y, s * 2.5, p.layers[2])).forEach(add)
  add(mist(200, 740, 500, 50, c('mist'), 0.2))
}

const oldOakClearing: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const ring = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 20 + r() * 16) add(pine(x, heightAt(ring, x) + 4, 0.9 + r() * 0.5, p.layers[3], c('bark')))
  const clearing = surface((x) => 525 + Math.sin(x / 50) * 4)
  add(<path d={clearing.d} fill={p.layers[2]} />)
  scatter(r, 120, clearing, 280, (x, y, s) => grass(x, y, s, p.layers[3], (r() - 0.5) * 8, 10 + r() * 8)).forEach(add)
  const ox = 170 + r() * 60
  add(bigOak(ox, 640, 3.4, p.layers[3], c('pine'), c('bark')))
  scatter(r, 30, clearing, 280, (x, y, s) => grass(x, y, s * 0.4, c('mapleGold'), 0, 5)).forEach(add)
}

const elderCreek: Painter = ({ p, r, night, add, layer }) => {
  const c = colors(night)
  layer(p.layers[0], 445, 22)
  const back = layer(p.layers[1], 500, 10)
  for (let x = 0; x < W; x += 20 + r() * 18) add(roundTree(x, heightAt(back, x) + 6, 0.9 + r() * 0.4, p.layers[2], c('bark')))
  const ground = surface((x) => heightAt(back, x) + 8)
  add(<path d={ground.d} fill={p.layers[2]} />)
  const creek = ribbon([150 + r() * 100, 510], 200, 80, 200)
  add(<path d={creek.d} fill={c('water')} />)
  for (let i = 4; i < 40; i += 2) {
    const q = creek.mid(i / 40)
    add(<path d={`M${n(q.x - q.w * 0.25)},${n(q.y)} q${n(q.w * 0.12)},-2 ${n(q.w * 0.25)},0`} stroke={c('ripple')} stroke-width={n(0.6 + depth(q.y) * 0.8)} fill="none" opacity={0.7} />)
  }
  // Elder bushes on the banks, with flat sprays of cream flowers.
  for (const side of [-1, 1]) {
    for (let t = 0.2; t <= 1; t += 0.2) {
      const q = creek.mid(t + r() * 0.08)
      const s = depth(q.y) * 1.6
      const x = q.x + side * (q.w / 2 + 26 * s)
      add(shrub(x, q.y, s * 1.6, p.layers[3]))
      for (let k = 0; k < 6; k++) add(<ellipse cx={n(x + (r() - 0.5) * 26 * s)} cy={n(q.y - (8 + r() * 10) * s)} rx={n(3 * s)} ry={n(1.6 * s)} fill={c('cream')} />)
    }
  }
}

export const FOREST: Record<string, Painter> = {
  'Fern Hollow': fernHollow,
  'Mossy Path': mossyPath,
  'Cedar Grove': cedarGrove,
  'Birch Glade': birchGlade,
  'Owl Wood': owlWood,
  'Pine Ridge': pineRidge,
  'Maple Trail': mapleTrail,
  'Acorn Dell': acornDell,
  'Misty Thicket': mistyThicket,
  'Old Oak Clearing': oldOakClearing,
  'Elder Creek': elderCreek,
}
