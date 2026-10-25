import { render } from 'preact'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { App } from './app'
import { watchInstallPrompt } from './meta/install'

watchInstallPrompt()

// An iPhone home-screen app draws a hazy band under the clock; the layout moves down out of it.
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('ios-app')

render(<App />, document.getElementById('app')!)
