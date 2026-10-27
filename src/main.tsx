import { render } from 'preact'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { App } from './app'
import { warmOffline } from '@shared/kit.js'

// iOS 26 sizes a home-screen app's page short by the clock's height, leaving a strip at the bottom.
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('ios-app')

render(<App />, document.getElementById('app')!)

// Once the game has settled, save all of it (every level pack and picture) for offline play
// through GameHub's offline helper. Only missing files are fetched, so later launches cost nothing.
if (import.meta.env.PROD) setTimeout(() => warmOffline(`${import.meta.env.BASE_URL}offline-files.json`), 4000)
