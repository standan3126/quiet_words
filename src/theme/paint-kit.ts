// Shared pieces for the painted scenes: canvas size, a seeded PRNG and ridge shapes.

export interface Palette {
  sky: [string, string] // top, horizon
  glow: string // sun or moon
  layers: string[] // far to near
  accent: string // flowers, foam, snow, stars
  water?: string
}

export const W = 400
export const H = 800

// Small seeded PRNG, so each location always gets the same landscape.
export function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Ridge {
  d: string
  tops: [number, number][] // the surface, every 8 units across
}

// A horizon line as a filled shape: a sum of a few sine waves, optionally sharpened into peaks.
export function ridge(r: () => number, baseY: number, amplitude: number, jagged = false): Ridge {
  const waves = [1, 2.3, 5.1].map((f, i) => ({ f, phase: r() * Math.PI * 2, amp: amplitude / (i + 1) }))
  return surface((x) => {
    let y = 0
    for (const w of waves) {
      const s = Math.sin((x / W) * Math.PI * w.f + w.phase)
      y += (jagged ? 1 - Math.abs(s) * 2 : s) * w.amp
    }
    return baseY - y
  })
}

// Any ground shape from a function giving its surface height across the picture.
export function surface(y: (x: number) => number): Ridge {
  const tops: [number, number][] = []
  for (let x = 0; x <= W; x += 8) tops.push([x, y(x)])
  const d = `M0,${H} ` + tops.map(([x, ty]) => `L${x},${ty.toFixed(1)}`).join(' ') + ` L${W},${H} Z`
  return { d, tops }
}

// The surface height of a ridge at any x.
export function heightAt(shape: Ridge, x: number): number {
  const i = Math.max(0, Math.min(shape.tops.length - 2, Math.floor(x / 8)))
  const [x0, y0] = shape.tops[i]
  const [x1, y1] = shape.tops[i + 1]
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}
