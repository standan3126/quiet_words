// Every place that has a painting of its own, by name.
import { COAST } from './coast'
import { DESERT } from './desert'
import { FOREST } from './forest'
import type { Painter } from './kit'
import { MEADOW } from './meadow'
import { MOUNTAIN } from './mountain'
import { NIGHT_SKY } from './night-sky'

export const PLACES: Record<string, Painter> = { ...MEADOW, ...FOREST, ...COAST, ...MOUNTAIN, ...DESERT, ...NIGHT_SKY }
