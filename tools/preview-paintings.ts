// Writes the painted scenes for one journey's places to files, to look at outside the game.
//   npm run paintings -- Meadow
// Writes private/paintings/<journey>/: one SVG per place by day and by night, and an
// index.html showing them all as postcards and as full phone backgrounds.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { VNode } from 'preact'
import type { LevelIndex } from '../src/game/level.ts'
import { H, W } from '../src/theme/paint-kit.ts'
import { scene } from '../src/theme/painted.tsx'

const journey = process.argv[2] ?? 'Meadow'
const root = join(import.meta.dirname, '..')
const index: LevelIndex = JSON.parse(readFileSync(join(root, 'public', 'levels', 'index.json'), 'utf8'))
const packs = index.packs.filter((p) => p.journey === journey)
if (!packs.length) throw new Error(`No places in journey "${journey}"`)

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// The scenes only use plain SVG elements, so a tiny serializer is enough.
function toSvg(node: unknown): string {
  if (node == null || node === false) return ''
  if (Array.isArray(node)) return node.map(toSvg).join('')
  if (typeof node !== 'object') return escape(String(node))
  const { type, props } = node as VNode<Record<string, unknown>>
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && v != null)
    .map(([k, v]) => ` ${k}="${escape(String(v))}"`)
    .join('')
  return `<${type as string}${attrs}>${toSvg(props.children)}</${type as string}>`
}

function painting(name: string, seed: number, night: boolean): string {
  const { p, parts } = scene(journey, seed, night, name)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="0.6" stop-color="${p.sky[1]}"/></linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>${toSvg(parts)}</svg>\n`
  )
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
const dir = join(root, 'private', 'paintings', slug(journey))
mkdirSync(dir, { recursive: true })

const cards: string[] = []
for (const pack of packs) {
  for (const night of [false, true]) writeFileSync(join(dir, `${slug(pack.name)}-${night ? 'night' : 'day'}.svg`), painting(pack.name, pack.id, night))
  const day = `${slug(pack.name)}-day.svg`
  const nightFile = `${slug(pack.name)}-night.svg`
  cards.push(`<section>
  <h2>${pack.name} <small>levels ${pack.firstLevel}–${pack.firstLevel + pack.levelCount - 1}</small></h2>
  <div class="row">
    <figure><div class="postcard"><img src="${day}"></div><figcaption>Postcard</figcaption></figure>
    <figure><img class="phone" src="${day}"><figcaption>Behind the puzzle, day</figcaption></figure>
    <figure><img class="phone" src="${nightFile}"><figcaption>Night</figcaption></figure>
  </div>
</section>`)
}

writeFileSync(
  join(dir, 'index.html'),
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${journey} paintings</title>
<style>
  body { font: 16px/1.4 Georgia, serif; background: #efe9dc; color: #3b3227; margin: 0; padding: 16px; }
  h1 { font-weight: normal; }
  h2 { font-weight: normal; margin: 28px 0 8px; }
  small { color: #8a7e6c; font-size: 0.8rem; }
  .row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
  figure { margin: 0; }
  figcaption { font-size: 0.8rem; color: #8a7e6c; margin-top: 4px; }
  .postcard { width: 150px; aspect-ratio: 3 / 4; border-radius: 10px; overflow: hidden; }
  .postcard img { width: 100%; height: 100%; object-fit: cover; object-position: bottom; display: block; }
  .phone { width: 180px; border-radius: 14px; display: block; }
</style>
<h1>${journey} paintings</h1>
${cards.join('\n')}
`,
)
console.log(`Wrote ${packs.length} places to ${dir}`)
