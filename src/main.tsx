import { render } from 'preact'
import './theme/themes.css'
import './ui/ui.css'
import './game/game.css'
import './theme/motion.css'
import { App } from './app'
import { watchInstallPrompt } from './meta/install'

watchInstallPrompt()

render(<App />, document.getElementById('app')!)
