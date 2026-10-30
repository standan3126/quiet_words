// Builds the two word lists every level is generated from:
//   data/valid.txt   - every real word, rude ones included (bonus words come from here)
//   data/answers.txt - common everyday words, most common first (crossword answers come from here)
// Run: npm run lexicon
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA = join(import.meta.dirname, '..', 'data')
const MIN_LEN = 3
const MAX_LEN = 8 // longest wheel
const ANSWER_POOL = 15_000

function lines(file: string): string[] {
  return readFileSync(join(DATA, file), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
}

const isPlainWord = (w: string) => /^[a-z]+$/.test(w) && w.length >= MIN_LEN && w.length <= MAX_LEN

const profanity = new Set(lines('raw/profanity_en.txt').map((l) => l.toLowerCase()))
const blocklist = new Set(lines('blocklist.txt'))

// SCOWL capitalises proper nouns, so a word listed only capitalised is mostly a name
// ("robbins", "joe"). It's also American-only, which drops British spellings from answers.
const everyday = new Set(lines('raw/scowl-american-english.txt').filter((w) => /^[a-z]+$/.test(w)))

// Every real word counts as a bonus word, rude ones too (players asked to collect them all).
// Profanity is still kept out of the grid answers below.
const valid = lines('raw/enable1.txt').filter((w) => isPlainWord(w))
const validSet = new Set(valid)

// en_50k.txt is "word count" per line, already sorted most frequent first.
// ENABLE has no abbreviations; SCOWL filters out words mainly used as names.
const answers: string[] = []
const seen = new Set<string>()
for (const line of lines('raw/en_50k.txt')) {
  const word = line.split(' ')[0].toLowerCase()
  if (!validSet.has(word) || !everyday.has(word) || profanity.has(word) || blocklist.has(word) || seen.has(word)) continue
  seen.add(word)
  answers.push(word)
  if (answers.length === ANSWER_POOL) break
}

writeFileSync(join(DATA, 'valid.txt'), valid.join('\n') + '\n')
writeFileSync(join(DATA, 'answers.txt'), answers.join('\n') + '\n')
console.log(`valid words: ${valid.length}, answer words: ${answers.length}`)
