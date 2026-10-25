// Registers the built-in daytime scenery images. Put images in public/scenery/ named
//   <journey>-<number>.<jpg|jpeg|png|webp>     e.g. coast-1.jpg
// then run: npm run scenery
// Writes public/scenery/manifest.json, which the game reads to pick each location's picture.
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { SceneImage } from '../src/theme/scenery.ts'
import { journeys } from './journeys.ts'

const DIR = join(import.meta.dirname, '..', 'public', 'scenery')
const MAX_BYTES = 1.5 * 1024 * 1024
mkdirSync(DIR, { recursive: true })

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
const bySlug = new Map(journeys.map((j) => [slug(j.name), j.name]))
const pattern = /^([a-z-]+?)-(\d+)\.(jpe?g|png|webp)$/

const images: SceneImage[] = []
for (const file of readdirSync(DIR).sort()) {
  if (file === 'manifest.json') continue
  const m = file.match(pattern)
  const journey = m && bySlug.get(m[1])
  if (!m || !journey) {
    console.warn(`skipped ${file}: name it <journey>-<n>.jpg, journey one of ${[...bySlug.keys()].join(', ')}`)
    continue
  }
  const size = statSync(join(DIR, file)).size
  if (size > MAX_BYTES) console.warn(`${file} is ${(size / 1024 / 1024).toFixed(1)} MB; under 1.5 MB keeps the app quick (try JPEG quality ~80, 1080x1920)`)
  images.push({ file, journey })
}

writeFileSync(join(DIR, 'manifest.json'), JSON.stringify(images, null, 1) + '\n')
for (const j of journeys) {
  const count = images.filter((i) => i.journey === j.name).length
  console.log(`${j.name.padEnd(10)} ${count} picture${count === 1 ? '' : 's'}${count ? '' : '   (painted scenes will be used)'}`)
}
