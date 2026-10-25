import type { Screen } from '../app'
import { MoonIcon, SunIcon } from './icons'

interface Props {
  theme: 'day' | 'night'
  ready: boolean
  level: number
  dailyDone: boolean
  onNavigate: (screen: Screen) => void
  onToggleTheme: () => void
}

export function Home({ theme, ready, level, dailyDone, onNavigate, onToggleTheme }: Props) {
  return (
    <main class="screen home">
      <button class="icon-button theme-toggle" onClick={onToggleTheme} aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}>
        {theme === 'night' ? <MoonIcon /> : <SunIcon />}
      </button>
      <div class="home-title">
        <h1>Quiet Words</h1>
        <p class="soft">a calm place to find words</p>
      </div>
      <nav class="home-menu">
        <button class="primary" disabled={!ready} onClick={() => onNavigate('play')}>
          {level > 1 ? `Continue · Level ${level}` : 'Begin your journey'}
        </button>
        <button disabled={!ready} onClick={() => onNavigate('daily')}>
          {dailyDone ? "Today's puzzle · finished" : "Today's puzzle"}
        </button>
        <button disabled={!ready} onClick={() => onNavigate('postcards')}>
          Postcards
        </button>
        <button onClick={() => onNavigate('settings')}>Settings</button>
      </nav>
    </main>
  )
}
