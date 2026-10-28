import { clear, createStore, del, entries, get, setMany, set, type UseStore } from 'idb-keyval'

// Quiet Words' own database ("quiet-words"), so no other game on GameHub's shared web address
// can write over it (GameHub contract, rule 5). Before 2026-10-28 everything lived in
// idb-keyval's shared default database; moveToOwnDatabase() copies it across once.
const db: UseStore = createStore('quiet-words', 'saves')

// Storage can be unavailable (private mode, cleared data). The game must still run, so
// every read falls back to a default and every write failure is ignored.
export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await get<T>(key, db)
    return value ?? fallback
  } catch {
    return fallback
  }
}

export async function save<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value, db)
  } catch {
    // Progress just won't persist this session.
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await del(key, db)
  } catch {}
}

export async function moveToOwnDatabase(): Promise<void> {
  try {
    if ((await entries(db)).length) return
    const old = createStore('keyval-store', 'keyval')
    const saved = await entries(old)
    if (!saved.length) return
    await setMany(saved, db)
    await clear(old)
  } catch {
    // Nothing to move, or storage is unavailable.
  }
}
