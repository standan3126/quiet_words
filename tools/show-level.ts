// Prints generated levels as text grids, for eyeballing puzzle quality.
// Run: npm run show -- 1 37 120
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LevelIndex, Pack } from '../src/game/level.ts'

const dir = join(import.meta.dirname, '..', 'public', 'levels')
const index: LevelIndex = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))

for (const id of process.argv.slice(2).map(Number)) {
  const summary = index.packs.find((p) => id >= p.firstLevel && id < p.firstLevel + p.levelCount)
  if (!summary) {
    console.log(`level ${id}: not generated`)
    continue
  }
  const pack: Pack = JSON.parse(readFileSync(join(dir, `pack-${String(summary.id).padStart(3, '0')}.json`), 'utf8'))
  const level = pack.levels.find((l) => l.id === id)!
  const rows = Array.from({ length: level.height }, () => Array(level.width).fill('·'))
  for (const p of level.words) {
    for (let i = 0; i < p.word.length; i++) {
      const x = p.dir === 'h' ? p.x + i : p.x
      const y = p.dir === 'v' ? p.y + i : p.y
      rows[y][x] = p.word[i].toUpperCase()
    }
  }
  console.log(`\nLevel ${id} — ${pack.name} (${pack.journey})   wheel: ${level.letters.toUpperCase()}`)
  console.log(rows.map((r) => '  ' + r.join(' ')).join('\n'))
  console.log(`  answers: ${level.words.map((p) => p.word).join(', ')}`)
  console.log(`  bonus (${level.extras.length}): ${level.extras.slice(0, 14).join(', ')}${level.extras.length > 14 ? ', …' : ''}`)
}
