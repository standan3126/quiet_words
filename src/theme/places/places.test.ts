import { describe, expect, it } from 'vitest'
import type { LevelIndex } from '../../game/level'
import levels from '../../../public/levels/index.json'
import { scene } from '../painted'
import { toSvg } from '../svg-string'
import { PLACES } from '.'

const index: LevelIndex = levels

describe('place paintings', () => {
  it('has a painting for every place', () => {
    for (const pack of index.packs) expect(PLACES[pack.name], pack.name).toBeTypeOf('function')
  })

  it('paints every place at night with no blue at all', () => {
    for (const pack of index.packs) {
      const svg = toSvg(scene(pack.journey, pack.id, true, pack.name).parts)
      const colours = svg.match(/#[0-9a-f]{6}/gi) ?? []
      for (const hex of colours) expect(hex.slice(5), `${pack.name}: ${hex}`).toBe('00')
      expect(svg, pack.name).not.toMatch(/NaN|undefined/)
    }
  })

  it('paints every place by day without errors', () => {
    for (const pack of index.packs) expect(toSvg(scene(pack.journey, pack.id, false, pack.name).parts), pack.name).not.toMatch(/NaN|undefined/)
  })
})
