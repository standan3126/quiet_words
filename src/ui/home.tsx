// The launch page, laid out like every GameHub game's (the toolbox's .hub-launch): the name at
// the top, where you are in the middle, Play and Levels pinned at the bottom. Hub (top left) and
// the Settings gear (top right) come from the toolbox frame.
interface Props {
  ready: boolean
  level: number
  revisiting: string | null // a place being played again from its postcard
  onPlay: () => void
  onLevels: () => void
}

export function Home({ ready, level, revisiting, onPlay, onLevels }: Props) {
  const where = revisiting ? `Visiting ${revisiting} again` : level > 1 ? `Level ${level}` : 'A journey through quiet places'
  return (
    <main class="hub-launch home">
      <header class="hub-launch-head home-title">
        <h1>Quiet Words</h1>
        <p>a calm place to find words</p>
      </header>
      <p class="home-where">{where}</p>
      <div class="hub-launch-actions">
        <button class="hub-play" disabled={!ready} onClick={onPlay}>
          Play
        </button>
        {/* Hidden, not removed, until there's a level behind you, so Play never moves. */}
        <button class="hub-levels" hidden={level < 2} onClick={onLevels}>
          Levels
        </button>
      </div>
    </main>
  )
}
