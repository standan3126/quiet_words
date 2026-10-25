export interface Definition {
  word: string
  pos: string
  base?: string // set when the word is an inflected form, e.g. "smiled" -> "smile"
  gloss: string
}

let defs: Promise<Record<string, string>> | undefined

// Loaded on first use; it's the largest data file, and only needed once a word is tapped.
export async function define(word: string): Promise<Definition | undefined> {
  defs ??= fetch(`${import.meta.env.BASE_URL}definitions.json`).then((r) => r.json())
  const entry = (await defs)[word]
  if (!entry) return undefined
  const parts = entry.split('|')
  return parts.length === 3 ? { word, pos: parts[0], base: parts[1], gloss: parts[2] } : { word, pos: parts[0], gloss: parts[1] }
}
