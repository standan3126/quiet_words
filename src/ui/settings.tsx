import { LAYER_LABELS, LAYERS } from '../audio/ambience'
import type { Album } from '../meta/albums'
import type { Settings, ThemeMode } from '../meta/settings'
import { DeviceSettings } from './device-settings'
import { BackIcon } from './icons'
import { ScenerySettings } from './scenery-settings'
import { SleepTimer, type SleepMinutes } from './sleep-timer'

interface Props {
  settings: Settings
  sleepMinutes: SleepMinutes
  albums: Album[]
  hasBuiltIn: boolean
  onChange: (patch: Partial<Settings>) => void
  onSleep: (minutes: SleepMinutes) => void
  onAlbums: () => void
  onBack: () => void
}

const themeModes: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
]

function Slider({ label, value, onInput }: { label: string; value: number; onInput: (v: number) => void }) {
  return (
    <label class="row">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onInput={(e) => onInput(Number((e.target as HTMLInputElement).value))}
      />
    </label>
  )
}

function Toggle({ label, hint, checked, onToggle }: { label: string; hint?: string; checked: boolean; onToggle: (v: boolean) => void }) {
  return (
    <label class="row">
      <span>
        {label}
        {hint && <small class="soft">{hint}</small>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle((e.target as HTMLInputElement).checked)} />
    </label>
  )
}

export function SettingsScreen({ settings, sleepMinutes, albums, hasBuiltIn, onChange, onSleep, onAlbums, onBack }: Props) {
  return (
    <main class="screen settings">
      <header class="screen-header">
        <button class="icon-button" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <h2>Settings</h2>
      </header>

      <section class="panel">
        <h3>Light</h3>
        <div class="segmented" role="radiogroup" aria-label="Theme">
          {themeModes.map((m) => (
            <button
              role="radio"
              aria-checked={settings.themeMode === m.value}
              class={settings.themeMode === m.value ? 'selected' : ''}
              onClick={() => onChange({ themeMode: m.value })}
            >
              {m.label}
            </button>
          ))}
        </div>
        {settings.themeMode === 'auto' && (
          <div class="row">
            <span>Night from</span>
            <span class="times">
              <input type="time" value={settings.nightStart} onChange={(e) => onChange({ nightStart: (e.target as HTMLInputElement).value })} />
              <span class="soft">to</span>
              <input type="time" value={settings.nightEnd} onChange={(e) => onChange({ nightEnd: (e.target as HTMLInputElement).value })} />
            </span>
          </div>
        )}
        <p class="soft note">Night mode uses only warm amber light — no blue.</p>
      </section>

      <ScenerySettings settings={settings} albums={albums} hasBuiltIn={hasBuiltIn} onChange={onChange} onAlbums={onAlbums} />

      <section class="panel">
        <h3>Sound</h3>
        <Slider label="Letter chimes" value={settings.volumeNotes} onInput={(v) => onChange({ volumeNotes: v })} />
        <Slider label="Nature sounds" value={settings.volumeAmbience} onInput={(v) => onChange({ volumeAmbience: v })} />
        <Slider label="Music" value={settings.volumeMusic} onInput={(v) => onChange({ volumeMusic: v })} />
        <Toggle label="Mute everything" checked={settings.muted} onToggle={(v) => onChange({ muted: v })} />
        <SleepTimer value={sleepMinutes} onChange={onSleep} />
      </section>

      <section class="panel">
        <h3>Nature sounds</h3>
        <Toggle
          label="Match the scenery"
          hint="Each place has its own sounds, gentler at night"
          checked={settings.ambienceMode === 'scene'}
          onToggle={(v) => onChange({ ambienceMode: v ? 'scene' : 'custom' })}
        />
        {settings.ambienceMode === 'custom' &&
          LAYERS.map((name) => (
            <Slider
              label={LAYER_LABELS[name]}
              value={settings.ambienceMix[name] ?? 0}
              onInput={(v) => onChange({ ambienceMix: { ...settings.ambienceMix, [name]: v } })}
            />
          ))}
      </section>

      <section class="panel">
        <h3>Comfort</h3>
        <Toggle
          label="Relaxed hints"
          hint="A free hint glows if you've been stuck a while"
          checked={settings.relaxedHints}
          onToggle={(v) => onChange({ relaxedHints: v })}
        />
        <Toggle label="Large text" checked={settings.largeText} onToggle={(v) => onChange({ largeText: v })} />
        <Toggle label="Gentle vibration" checked={settings.haptics} onToggle={(v) => onChange({ haptics: v })} />
      </section>

      <DeviceSettings />
    </main>
  )
}
