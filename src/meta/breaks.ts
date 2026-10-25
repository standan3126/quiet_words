// The little games between journey levels: which kinds the player wants, and how often.

export type BreakKind = 'wordsearch' | 'grammar' | 'spelling' | 'mistake' | 'speech' | 'punctuation' | 'unscramble'

export const BREAK_KINDS: { kind: BreakKind; label: string; hint: string }[] = [
  { kind: 'wordsearch', label: 'Word search', hint: 'Find themed words hidden every which way' },
  { kind: 'grammar', label: 'Fill the blank', hint: 'Their, there or they’re, and friends' },
  { kind: 'spelling', label: 'Spelling', hint: 'Pick the right spelling of a tricky word' },
  { kind: 'mistake', label: 'Spot the mistake', hint: 'Tap the word that doesn’t belong' },
  { kind: 'speech', label: 'Parts of speech', hint: 'Tap the verb, the adjective or the adverb' },
  { kind: 'punctuation', label: 'Punctuation', hint: 'Choose the sentence written correctly' },
  { kind: 'unscramble', label: 'Sentence builder', hint: 'Put the jumbled words back in order' },
]

export const ALL_BREAK_KINDS = BREAK_KINDS.map((b) => b.kind)

// How many levels between breaks, from never (0) up to after every level.
export const BREAK_EVERY_STOPS = [0, 15, 10, 6, 4, 3, 2, 1]
export const DEFAULT_BREAK_EVERY = 6

export function describeEvery(every: number): string {
  if (!every) return 'Never'
  if (every === 1) return 'After every level'
  if (every === 15) return 'Every 15 levels · once a place'
  return `Every ${every} levels`
}

// A short untimed break between journey levels.
export interface Break {
  kind: BreakKind
  after: number // the level it follows; also seeds the word search
}

// Which break, if any, follows a journey level. The chosen kinds come round in a shuffled
// order, each once before any repeats.
export function breakAfter(level: number, every: number, kinds: BreakKind[]): Break | null {
  const enabled = ALL_BREAK_KINDS.filter((k) => kinds.includes(k))
  if (!every || !enabled.length || level % every) return null
  const n = level / every
  const round = Math.floor(n / enabled.length)
  let seed = round * 7919 + 17
  const order = [...enabled]
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return { kind: order[n % enabled.length], after: level }
}
