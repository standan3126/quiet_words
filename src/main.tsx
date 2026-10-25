import { render } from 'preact'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { App } from './app'
import { watchInstallPrompt } from './meta/install'

watchInstallPrompt()

// iOS 26 sizes a home-screen app's page short by the clock's height, leaving a strip at the bottom.
if ((navigator as Navigator & { standalone?: boolean }).standalone) document.documentElement.classList.add('ios-app')

render(<App />, document.getElementById('app')!)
