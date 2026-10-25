// Builds public/definitions.json: a short WordNet definition for every word in the levels,
// shown when a player taps a solved word.
// Needs WordNet 3.1 unpacked in data/raw/wordnet/dict (see data/SOURCES.md).
// Run after `npm run levels`: npm run definitions
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Level, Pack } from '../src/game/level.ts'

const ROOT = join(import.meta.dirname, '..')
const WN = join(ROOT, 'data', 'raw', 'wordnet', 'dict')
const LEVELS = join(ROOT, 'public', 'levels')
const MAX_GLOSS = 140

type Pos = 'noun' | 'verb' | 'adj' | 'adv'
const POS: Pos[] = ['noun', 'verb', 'adj', 'adv']

// index.<pos>: lemma -> { senses: offsets most common first, tagged: how often it's used this way }
interface Entry {
  offsets: string[]
  tagged: number
}
const index = new Map<Pos, Map<string, Entry>>()
const data = new Map<Pos, Map<string, string>>()
const exceptions = new Map<Pos, Map<string, string[]>>()

for (const pos of POS) {
  const entries = new Map<string, Entry>()
  for (const line of readFileSync(join(WN, `index.${pos}`), 'utf8').split('\n')) {
    if (!line || line.startsWith(' ')) continue // licence header
    const t = line.trim().split(' ')
    const synsets = Number(t[2])
    const pointers = Number(t[3])
    entries.set(t[0], { offsets: t.slice(-synsets), tagged: Number(t[5 + pointers]) })
  }
  index.set(pos, entries)

  const glosses = new Map<string, string>()
  for (const line of readFileSync(join(WN, `data.${pos}`), 'utf8').split('\n')) {
    if (!line || line.startsWith(' ')) continue
    const bar = line.indexOf(' | ')
    if (bar > 0) glosses.set(line.slice(0, 8), line.slice(bar + 3).trim())
  }
  data.set(pos, glosses)

  const exc = new Map<string, string[]>()
  for (const line of readFileSync(join(WN, `${pos}.exc`), 'utf8').split('\n')) {
    const [inflected, ...bases] = line.trim().split(' ')
    if (inflected) exc.set(inflected, bases)
  }
  exceptions.set(pos, exc)
}

// WordNet's "morphy" suffix rules: inflected ending -> base ending.
const rules: Record<Pos, [string, string][]> = {
  noun: [['s', ''], ['ses', 's'], ['xes', 'x'], ['zes', 'z'], ['ches', 'ch'], ['shes', 'sh'], ['men', 'man'], ['ies', 'y']],
  verb: [['s', ''], ['ies', 'y'], ['es', 'e'], ['es', ''], ['ed', 'e'], ['ed', ''], ['ing', 'e'], ['ing', '']],
  adj: [['er', ''], ['est', ''], ['er', 'e'], ['est', 'e']],
  adv: [],
}

function baseForms(word: string, pos: Pos): string[] {
  const forms = [...(exceptions.get(pos)!.get(word) ?? [])]
  for (const [from, to] of rules[pos]) if (word.endsWith(from)) forms.push(word.slice(0, -from.length) + to)
  return forms.filter((f) => index.get(pos)!.has(f))
}

// Drop the quoted example sentences, keep the definition itself.
function tidy(gloss: string): string {
  const parts = gloss.split(/;\s*/).filter((p) => p && !p.startsWith('"'))
  let text = parts[0] ?? ''
  for (const p of parts.slice(1)) if (text.length + p.length + 2 <= MAX_GLOSS) text += `; ${p}`
  return text.length > MAX_GLOSS ? text.slice(0, MAX_GLOSS - 1).trimEnd() + '…' : text
}

// Prefer the word itself (in its most-used part of speech), otherwise its base form.
function define(word: string): { base: string; pos: Pos; gloss: string } | undefined {
  const pick = (cands: { base: string; pos: Pos }[]) => {
    let best: { base: string; pos: Pos; tagged: number } | undefined
    for (const c of cands) {
      const tagged = index.get(c.pos)!.get(c.base)!.tagged
      if (!best || tagged > best.tagged) best = { ...c, tagged }
    }
    return best
  }
  const best =
    pick(POS.filter((pos) => index.get(pos)!.has(word)).map((pos) => ({ base: word, pos }))) ??
    pick(POS.flatMap((pos) => baseForms(word, pos).map((base) => ({ base, pos }))))
  if (!best) return undefined
  const offset = index.get(best.pos)!.get(best.base)!.offsets[0]
  const gloss = data.get(best.pos)!.get(offset)
  return gloss ? { base: best.base, pos: best.pos, gloss: tidy(gloss) } : undefined
}

const words = new Set<string>()
const levels: Level[] = JSON.parse(readFileSync(join(LEVELS, 'daily.json'), 'utf8'))
for (const file of readdirSync(LEVELS).filter((f) => f.startsWith('pack-'))) {
  const pack: Pack = JSON.parse(readFileSync(join(LEVELS, file), 'utf8'))
  levels.push(...pack.levels)
}
for (const level of levels) {
  level.words.forEach((p) => words.add(p.word))
  level.extras.forEach((w) => words.add(w))
}

// Hand-written entries for everyday words WordNet leaves out (and, the, she...).
const extra = new Map<string, string>()
for (const line of readFileSync(join(ROOT, 'data', 'definitions-extra.txt'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue
  const [word, pos, gloss] = line.split('|')
  extra.set(word, `${pos}|${gloss}`)
}

// Compact format: word -> "pos|gloss", or "pos|base|gloss" when it's an inflected form.
const out: Record<string, string> = {}
let missing = 0
for (const word of [...words].sort()) {
  const d = define(word)
  if (d) out[word] = d.base === word ? `${d.pos}|${d.gloss}` : `${d.pos}|${d.base}|${d.gloss}`
  else if (extra.has(word)) out[word] = extra.get(word)!
  else missing++
}

writeFileSync(join(ROOT, 'public', 'definitions.json'), JSON.stringify(out))
console.log(`defined ${Object.keys(out).length} of ${words.size} words (${missing} obscure bonus words without one)`)
