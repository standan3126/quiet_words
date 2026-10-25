import type { Level } from './level'

// Today's date in local time, as YYYY-MM-DD.
export function todayKey(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Whole days since 1 Jan 2026, counted from the date itself so time zones don't matter.
export function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 86_400_000)
}

let daily: Promise<Level[]> | undefined

// The same puzzle for everyone on a given day; the year of puzzles repeats after 365 days.
export async function loadDaily(key: string): Promise<Level> {
  daily ??= fetch(`${import.meta.env.BASE_URL}levels/daily.json`).then((r) => r.json())
  const all = await daily
  return all[((dayNumber(key) % all.length) + all.length) % all.length]
}

// The word the butterfly rests on: never the longest word, so it's a small treat to find.
export function butterflyWord(level: Level): string {
  const longest = Math.max(...level.words.map((w) => w.word.length))
  const others = level.words.filter((w) => w.word.length < longest)
  return (others.length ? others : level.words)[level.id % (others.length || level.words.length)].word
}

export function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}
