import { render } from 'preact'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { App } from './app'
import { warmOffline } from '@shared/kit.js'

// iOS 26 sizes a home-screen app's page short by the clock's height, leaving a strip at the bottom.
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('ios-app')

// With a solid (white) top bar instead of the see-through one, the page starts below the bar,
// so the full-screen height above would push the tools off the bottom. iOS keeps the bar style
// from when the app was added to the home screen, so this can happen on older installs of
// GameHub. Then the page uses exactly the height it's given.
if ((navigator as Navigator & { standalone?: boolean }).standalone) {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;height:0;padding-top:env(safe-area-inset-top);visibility:hidden'
  document.body.append(probe)
  if (probe.offsetHeight === 0) {
    const root = document.documentElement
    const fit = () => root.style.setProperty('--app-height', `${window.innerHeight}px`)
    fit()
    window.addEventListener('resize', fit)
    root.classList.add('ios-solid-bar')
  }
  probe.remove()
}

render(<App />, document.getElementById('app')!)

// Once the game has settled, save all of it (every level pack and picture) for offline play
// through GameHub's offline helper. Only missing files are fetched, so later launches cost nothing.
if (import.meta.env.PROD) setTimeout(() => warmOffline(`${import.meta.env.BASE_URL}offline-files.json`), 4000)
