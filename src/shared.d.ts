// Types for the GameHub toolbox (plain JavaScript in ../hub/shared/v1, bundled in as @shared).
// Only what Quiet Words uses. The rules for using it are in the hub's shared/CONTRACT.md.

declare module '@shared/kit.js' {
  export function setupPage(): void
  export function tapToStart(options: { title: string; subtitle?: string; button?: string; onStart?: () => void }): Promise<void>
  export function gameFrame(options: { onSettings?: () => void; beforeExit?: () => unknown; onHome?: () => void }): {
    setPage(page: 'launch' | 'play'): void
  }
  // Saves every file in the list for offline play, in the background.
  export function warmOffline(listUrl: string): Promise<void>
}

declare module '@shared/save.js' {
  export interface Store {
    get<T>(key: string, fallback?: T): T
    set(key: string, value: unknown): boolean
    remove(key: string): void
    keys(): string[]
    all(): Record<string, unknown>
    replaceAll(data: Record<string, unknown>): void
  }
  export function gameStore(gameId: string): Store
}

declare module '@shared/sound/index.js' {
  export type Mix = Partial<Record<string, number>>
  export class Sound {
    constructor(volumes?: { notes?: number; nature?: number; music?: number })
    unlock(): void
    step(index: number): void // climbs a scale (Quiet Words' letter chime)
    chime(): void // a word found
    sparkle(): void // a bonus word
    soft(): void // already found / not quite
    ping(): void // a hint
    celebrate(): void // level finished
  }
}

declare module '@shared/settings.js' {
  import type { Store } from '@shared/save.js'
  import type { Sound } from '@shared/sound/index.js'
  type Build = (el: HTMLElement, panel: SettingsPanel) => void
  export class SettingsPanel {
    constructor(options: {
      gameId: string
      store: Store
      sound?: Sound
      notesLabel?: string | null
      defaults?: Record<string, unknown>
      look?: Build
      sections?: { title: string; place?: 'look' | 'play'; build: Build }[]
      manual?: { fields: { id: string; label: string; min?: number; get: () => number }[]; onSet: (values: Record<string, number>) => string | void }
      credits?: (string | HTMLElement)[]
      onChange?: (settings: Record<string, unknown>, patch: Record<string, unknown>) => void
      onRestore?: (data: Record<string, unknown>) => void
      exportData?: () => Record<string, unknown>
      placeNature?: () => Record<string, number>
    })
    settings: Record<string, unknown>
    night: boolean
    open(): void
    close(): void
    set(patch: Record<string, unknown>): void
    applySound(): void
  }
  export function toggle(o: { label: string; hint?: string; checked: boolean; onToggle: (on: boolean) => void }): HTMLElement
  export function slider(o: { label: string; hint?: string; value: number; min?: number; max?: number; step?: number; onInput: (v: number) => void }): HTMLElement
  export function choice<T>(o: { label?: string; options: { value: T; label: string }[]; value: T; onPick: (v: T) => void }): HTMLElement
  export function note(text: string): HTMLElement
}
