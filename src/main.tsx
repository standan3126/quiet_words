import { render } from 'preact'
import '@shared/kit.css'
import '@shared/settings.css'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { setupPage, tapToStart, warmOffline } from '@shared/kit.js'
import { App } from './app'
import { sound, startPanel, store } from './hub'
import { moveOldSettings } from './meta/settings'
import { moveToOwnDatabase } from './meta/storage'

// iPhone home-screen sizing (html.ios-app, and html.ios-solid-bar + --app-height under the old
// solid top bar), from the toolbox.
setupPage()

// Saves from before 2026-10-28 move to Quiet Words' own database, and its old settings to the
// shared panel, before anything reads them.
async function start() {
  await moveToOwnDatabase()
  await moveOldSettings(store)
  startPanel()
  render(<App />, document.getElementById('app')!)
  // Sound may only begin from a tap on iPhone.
  tapToStart({ title: 'Quiet Words', subtitle: 'a calm place to find words', onStart: () => sound.unlock() })
}
start()

// Once the game has settled, save all of it (every level pack and picture) for offline play
// through GameHub's offline helper. Only missing files are fetched, so later launches cost nothing.
if (import.meta.env.PROD) setTimeout(() => warmOffline(`${import.meta.env.BASE_URL}offline-files.json`), 4000)
