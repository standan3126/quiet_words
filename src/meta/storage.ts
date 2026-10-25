import { get, set } from 'idb-keyval'

// Storage can be unavailable (private mode, cleared data). The game must still run, so
// every read falls back to a default and every write failure is ignored.
export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await get<T>(key)
    return value ?? fallback
  } catch {
    return fallback
  }
}

export async function save<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value)
  } catch {
    // Progress just won't persist this session.
  }
}
