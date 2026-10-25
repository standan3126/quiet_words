export const SLEEP_CHOICES = [null, 15, 30, 60] as const
export type SleepMinutes = (typeof SLEEP_CHOICES)[number]

interface Props {
  value: SleepMinutes
  onChange: (minutes: SleepMinutes) => void
}

export function SleepTimer({ value, onChange }: Props) {
  return (
    <div class="row sleep-row">
      <span>
        Sleep timer
        <small class="soft">Sound fades out gently, then the screen dims</small>
      </span>
      <div class="segmented compact" role="radiogroup" aria-label="Sleep timer">
        {SLEEP_CHOICES.map((m) => (
          <button role="radio" aria-checked={value === m} class={value === m ? 'selected' : ''} onClick={() => onChange(m)}>
            {m === null ? 'Off' : `${m}m`}
          </button>
        ))}
      </div>
    </div>
  )
}
