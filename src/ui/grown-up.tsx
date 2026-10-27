// Grown-up tools: setting the level by hand, for when progress is lost. Hidden so nobody is
// tempted to skip ahead: tap the Settings heading 5 times quickly and enter the family code
// (checked by GameHub's shared secret.js). Nothing is remembered; leaving Settings hides it again.
import { checkCode } from '@shared/secret.js'
import { useEffect, useRef, useState } from 'preact/hooks'
import { loadIndex } from '../game/levels'

const TAPS = 5
const WITHIN_MS = 2500

// Counts quick taps; returns the tap handler and whether the code box should show.
export function useSecretTaps(): [() => void, boolean] {
  const taps = useRef<number[]>([])
  const [asking, setAsking] = useState(false)
  const tap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < WITHIN_MS), now]
    if (taps.current.length >= TAPS) setAsking(true)
  }
  return [tap, asking]
}

interface Props {
  level: number
  coins: number
  onSet: (level: number, coins: number) => void
}

export function GrownUpTools({ level, coins, onSet }: Props) {
  const [totalLevels, setTotalLevels] = useState(level)
  useEffect(() => {
    loadIndex().then((index) => setTotalLevels(index.totalLevels))
  }, [])
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)
  const [newLevel, setNewLevel] = useState(String(level))
  const [newCoins, setNewCoins] = useState(String(coins))
  const [note, setNote] = useState('')

  if (!unlocked)
    return (
      <form
        class="secret-code"
        onSubmit={async (e) => {
          e.preventDefault()
          if (await checkCode(code)) setUnlocked(true)
          else {
            setWrong(true)
            setCode('')
          }
        }}
      >
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Code"
          placeholder={wrong ? 'Not quite. Try again' : 'Code'}
          value={code}
          onInput={(e) => setCode((e.target as HTMLInputElement).value)}
          autoFocus
        />
        <button type="submit" class="primary-button">
          OK
        </button>
      </form>
    )

  const set = () => {
    const l = Math.min(totalLevels, Math.max(1, Math.floor(Number(newLevel)) || 1))
    const c = Math.max(0, Math.floor(Number(newCoins)) || 0)
    onSet(l, c)
    setNote(`Set to level ${l} with ${c} coins.`)
  }

  return (
    <section class="panel">
      <h3>Set progress by hand</h3>
      <p class="soft note">For when progress is lost. The next level played starts fresh.</p>
      <label class="row">
        <span>Level (1–{totalLevels})</span>
        <input type="number" inputMode="numeric" min={1} max={totalLevels} aria-label="Level" value={newLevel} onInput={(e) => setNewLevel((e.target as HTMLInputElement).value)} />
      </label>
      <label class="row">
        <span>Coins</span>
        <input type="number" inputMode="numeric" min={0} aria-label="Coins" value={newCoins} onInput={(e) => setNewCoins((e.target as HTMLInputElement).value)} />
      </label>
      <button class="primary-button" onClick={set}>
        Set
      </button>
      {note && <p class="soft note" role="status">{note}</p>}
    </section>
  )
}
