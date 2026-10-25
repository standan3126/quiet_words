import type { Mix } from './ambience'

// The nature sounds that go with each journey, by day and by night.
// Night leans on crickets, rain and fire rather than bright birdsong.
const SCENES: Record<string, { day: Mix; night: Mix }> = {
  Meadow: { day: { birds: 0.55, wind: 0.3 }, night: { crickets: 0.5, wind: 0.25 } },
  Forest: { day: { birds: 0.5, creek: 0.4 }, night: { rain: 0.5, creek: 0.2 } },
  Coast: { day: { waves: 0.65, wind: 0.2 }, night: { waves: 0.6 } },
  Mountain: { day: { wind: 0.45, creek: 0.35 }, night: { wind: 0.35, fire: 0.4 } },
  Desert: { day: { wind: 0.5 }, night: { crickets: 0.4, fire: 0.4 } },
  'Night Sky': { day: { crickets: 0.45, fire: 0.45 }, night: { crickets: 0.45, fire: 0.45 } },
}

export function sceneMix(journey: string | undefined, theme: 'day' | 'night'): Mix {
  return (SCENES[journey ?? 'Meadow'] ?? SCENES.Meadow)[theme]
}
