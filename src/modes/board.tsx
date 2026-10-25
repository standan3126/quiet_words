// The crossword board: wheel, grid, hints and the gentle "Lovely." card. Used by both the
// journey and the daily puzzle, which decide where its coins and progress go.
import type { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { audio } from '../audio/engine'
import { define, type Definition } from '../game/definitions'
import { Grid, type Flash } from '../game/grid'
import { bullseye, hiddenCells, HINT_COST, lightbulb, RELAXED_HINT_AFTER_MS, rocket, ROCKET_LETTERS, type HintKind } from '../game/hints'
import type { Level } from '../game/level'
import { isLevelComplete, wordCells, type LevelProgress } from '../game/level-state'
import { applyOutcome, classify, type Outcome } from '../game/validator'
import { Wheel } from '../game/wheel'
import { COINS_PER_BONUS, type Stats } from '../meta/progress'
import type { Settings } from '../meta/settings'
import { SleepTimer, type SleepMinutes } from '../ui/sleep-timer'
import { BackIcon, BulbIcon, CoinIcon, MoreIcon, RocketIcon, ShuffleIcon, SparkleIcon, TargetIcon } from '../ui/icons'

export interface BoardProps {
  level: Level
  title: string
  subtitle: string
  lp: LevelProgress
  coins: number
  settings: Settings
  sleepMinutes: SleepMinutes
  completionCoins: number
  finishedNote: string // shown above "Lovely." when the level is done
  butterfly?: { word: string; coins: number } // the daily puzzle's marked word
  onCommit: (next: LevelProgress, coins: number, stats: Partial<Stats>) => void
  onSkip?: () => void
  onContinue: () => void
  onSettings: (patch: Partial<Settings>) => void
  onSleep: (minutes: SleepMinutes) => void
  onHome: () => void
}

type Preview = { text: string; state: 'tracing' | Outcome['kind']; id: number }

const buzz = (settings: Settings, ms: number) => settings.haptics && navigator.vibrate?.(ms)

// Remount (key it by level id) for each new level, so all of this state starts fresh.
export function Board(props: BoardProps) {
  const { level, lp, coins, settings, butterfly } = props
  const [preview, setPreview] = useState<Preview>({ text: '', state: 'tracing', id: 0 })
  const [message, setMessage] = useState<{ text: string; id: number } | null>(null)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [shuffleCount, setShuffleCount] = useState(0)
  const [targeting, setTargeting] = useState(false)
  const [freeHint, setFreeHint] = useState(false)
  const [panel, setPanel] = useState<'none' | 'bonus' | 'menu' | 'words'>('none')
  const [meanings, setMeanings] = useState<(Definition | { word: string; gloss?: undefined })[]>([])
  const [earned, setEarned] = useState<number | null>(null) // coins from the level just finished
  const lastProgressAt = useRef(Date.now())
  const traceLength = useRef(0)
  const ids = useRef(0)
  const nextId = () => ++ids.current

  // Relaxed hints: after a long quiet spell, offer a free lightbulb.
  useEffect(() => {
    if (!settings.relaxedHints) return setFreeHint(false)
    const id = setInterval(() => {
      if (Date.now() - lastProgressAt.current > RELAXED_HINT_AFTER_MS) setFreeHint(true)
    }, 5000)
    return () => clearInterval(id)
  }, [settings.relaxedHints])

  // Messages drift away on their own.
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(null), 1800)
    return () => clearTimeout(id)
  }, [message])

  const complete = isLevelComplete(level, lp)

  // Keyboard play: type letters from the wheel, Backspace to undo, Enter to submit, Escape to clear.
  const typed = useRef('')
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (complete || panel !== 'none' || e.metaKey || e.ctrlKey || e.altKey) return
      const show = (text: string) => {
        typed.current = text
        setPreview((prev) => ({ text, state: 'tracing', id: prev.state === 'tracing' ? prev.id : nextId() }))
      }
      const key = e.key.toLowerCase()
      if (/^[a-z]$/.test(key)) {
        const used = [...typed.current].filter((c) => c === key).length
        const available = [...level.letters].filter((c) => c === key).length
        if (used >= available) return // not on the wheel, or already used up
        show(typed.current + key)
        audio.letter(typed.current.length - 1)
      } else if (e.key === 'Backspace' && typed.current) {
        show(typed.current.slice(0, -1))
      } else if (e.key === 'Escape' && typed.current) {
        show('')
      } else if (e.key === 'Enter' && typed.current) {
        const word = typed.current
        typed.current = ''
        onWord(word)
      } else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Applies a change to this level's progress, and rewards the level if it just finished.
  const commit = (next: LevelProgress, coinDelta = 0, stats: Partial<Stats> = {}) => {
    const finished = !complete && isLevelComplete(level, next)
    let total = coinDelta + (finished ? props.completionCoins : 0)
    // Challenge words have no crossings to help, so they pay a coin per letter.
    for (const p of level.words) {
      if (p.challenge && !lp.found.includes(p.word) && next.found.includes(p.word)) {
        total += p.word.length
        setMessage({ text: `Challenge word · +${p.word.length}`, id: nextId() })
      }
    }
    if (butterfly && !lp.found.includes(butterfly.word) && next.found.includes(butterfly.word)) {
      total += butterfly.coins
      setMessage({ text: `The butterfly flutters off · +${butterfly.coins}`, id: nextId() })
    }
    if (finished) {
      setEarned(props.completionCoins + next.bonus.length * COINS_PER_BONUS)
      setTargeting(false)
      setTimeout(audio.levelComplete, 700) // after the last word's chord has rung
    }
    props.onCommit(next, total, { ...stats, levelsDone: finished ? 1 : 0 })
  }

  const madeProgress = () => {
    lastProgressAt.current = Date.now()
    setFreeHint(false)
  }

  const onWord = (word: string) => {
    if (complete) return
    const outcome = classify(word, level, lp)
    setPreview({ text: word, state: outcome.kind, id: nextId() })
    const next = applyOutcome(outcome, level, lp)
    switch (outcome.kind) {
      case 'answer':
        madeProgress()
        setFlash({ word, kind: 'new', id: nextId() })
        audio.word()
        buzz(settings, 12)
        commit(next, 0, { wordsFound: 1 })
        break
      case 'bonus':
        madeProgress()
        setMessage({ text: `Bonus word · +${COINS_PER_BONUS}`, id: nextId() })
        audio.bonus()
        commit(next, COINS_PER_BONUS, { bonusFound: 1 })
        break
      case 'repeat':
        if (outcome.inGrid) setFlash({ word, kind: 'repeat', id: nextId() })
        audio.repeat()
        setMessage({ text: 'Already found', id: nextId() })
        break
    }
  }

  const cost = (kind: HintKind) => (kind === 'lightbulb' && freeHint ? 0 : HINT_COST[kind])
  const canAfford = (kind: HintKind) => coins >= cost(kind) && hiddenCells(level, lp).length > 0

  const applyHint = (kind: HintKind) => {
    if (complete) return
    if (kind === 'bullseye') return setTargeting((t) => !t)
    if (!canAfford(kind)) return
    const price = cost(kind)
    const next = kind === 'lightbulb' ? lightbulb(level, lp) : rocket(level, lp)
    if (price === 0) madeProgress()
    audio.reveal()
    commit(next, -price)
  }

  const showMeanings = async (words: string[]) => {
    setMeanings(await Promise.all(words.map(async (word) => (await define(word)) ?? { word })))
    setPanel('words')
  }

  const onCellTap = (key: string) => {
    if (!targeting) {
      // Tapping a solved square shows what its word(s) mean.
      const words = level.words.filter((p) => lp.found.includes(p.word) && wordCells(p).includes(key)).map((p) => p.word)
      if (words.length) showMeanings(words)
      return
    }
    if (!canAfford('bullseye')) return
    const next = bullseye(level, lp, key)
    if (next === lp) return // tapped a letter that's already showing
    setTargeting(false)
    audio.reveal()
    commit(next, -HINT_COST.bullseye)
  }

  const butterflyCell = (() => {
    if (!butterfly || lp.found.includes(butterfly.word)) return undefined
    const p = level.words.find((w) => w.word === butterfly.word)
    return p && wordCells(p)[0]
  })()

  const tools: { kind: HintKind; label: string; Icon: () => JSX.Element }[] = [
    { kind: 'lightbulb', label: 'Reveal a letter', Icon: BulbIcon },
    { kind: 'bullseye', label: 'Reveal the square you tap', Icon: TargetIcon },
    { kind: 'rocket', label: `Reveal ${ROCKET_LETTERS} letters`, Icon: RocketIcon },
  ]

  return (
    <main class="play">
      <header class="play-header">
        <button class="icon-button" onClick={props.onHome} aria-label="Home">
          <BackIcon />
        </button>
        <div class="play-title">
          <div>{props.title}</div>
          <small class="soft">{props.subtitle}</small>
        </div>
        <div class="coins" aria-label={`${coins} coins`}>
          <CoinIcon />
          <span>{coins}</span>
        </div>
        <button class="icon-button" onClick={() => setPanel(panel === 'menu' ? 'none' : 'menu')} aria-label="More">
          <MoreIcon />
        </button>
      </header>

      <Grid level={level} progress={lp} flash={flash} targeting={targeting} butterflyCell={butterflyCell} onCellTap={onCellTap} />

      <div class={`preview ${preview.state}`} key={preview.id} aria-live="polite">
        {preview.text.split('').map((ch) => (
          <span>{ch.toUpperCase()}</span>
        ))}
      </div>
      <div class="message" key={message?.id}>
        {targeting ? 'Tap any empty square to reveal it' : message?.text}
      </div>

      <div class="wheel-row">
        <Wheel
          letters={level.letters}
          shuffleCount={shuffleCount}
          onTrace={(text) => {
            // Each letter added climbs the scale; undoing a letter is silent.
            if (text.length > traceLength.current) audio.letter(text.length - 1)
            traceLength.current = text.length
            if (text) setPreview((prev) => ({ text, state: 'tracing', id: prev.state === 'tracing' ? prev.id : nextId() }))
          }}
          onWord={onWord}
        />
      </div>

      <nav class="tools" aria-label="Tools">
        <button class="tool" onClick={() => setShuffleCount((c) => c + 1)} aria-label="Shuffle letters">
          <ShuffleIcon />
          <small>free</small>
        </button>
        <button class="tool bonus-tool" onClick={() => setPanel(panel === 'bonus' ? 'none' : 'bonus')} aria-label={`Bonus words found: ${lp.bonus.length}`}>
          <SparkleIcon size={24} />
          <small>{lp.bonus.length}</small>
        </button>
        {tools.map(({ kind, label, Icon }) => {
          const price = cost(kind)
          const classes = ['tool', price === 0 && 'free', kind === 'bullseye' && targeting && 'on'].filter(Boolean).join(' ')
          return (
            <button class={classes} disabled={!canAfford(kind) || complete} onClick={() => applyHint(kind)} aria-label={`${label}, ${price ? `${price} coins` : 'free'}`} aria-pressed={kind === 'bullseye' ? targeting : undefined}>
              <Icon />
              <small>{price ? <><CoinIcon size={12} />{price}</> : 'free'}</small>
            </button>
          )
        })}
      </nav>

      {panel === 'bonus' && (
        <div class="sheet panel" role="dialog" aria-label="Bonus words">
          <h3>Bonus words</h3>
          {lp.bonus.length ? (
            <p class="word-list">
              {lp.bonus.map((w) => (
                <button class="word-chip" onClick={() => showMeanings([w])}>{w}</button>
              ))}
            </p>
          ) : (
            <p class="soft">Real words that aren't in the puzzle count here, and earn {COINS_PER_BONUS} coins each.</p>
          )}
          <button class="text-button" onClick={() => setPanel('none')}>Close</button>
        </div>
      )}

      {panel === 'words' && (
        <div class="sheet panel" role="dialog" aria-label="Word meanings">
          {meanings.map((m) => (
            <div class="meaning">
              <h3>
                {m.word}
                {m.gloss && <small class="soft"> · {m.pos}{m.base ? ` (from ${m.base})` : ''}</small>}
              </h3>
              <p>{m.gloss ?? <span class="soft">A real word, though a rare one — no definition on hand.</span>}</p>
            </div>
          ))}
          <button class="text-button" onClick={() => setPanel('none')}>Close</button>
        </div>
      )}

      {panel === 'menu' && (
        <div class="sheet panel" role="dialog" aria-label="Options">
          <h3>Options</h3>
          <label class="row">
            <span>Sound</span>
            <input type="checkbox" checked={!settings.muted} onChange={(e) => props.onSettings({ muted: !(e.target as HTMLInputElement).checked })} aria-label="Sound on" />
          </label>
          <SleepTimer value={props.sleepMinutes} onChange={props.onSleep} />
          {props.onSkip && (
            <>
              <p class="soft">Not enjoying this level? You can move on any time — no penalty.</p>
              <button
                class="primary-button"
                onClick={() => {
                  setPanel('none')
                  props.onSkip!()
                }}
              >
                Skip this level
              </button>
            </>
          )}
          <button class="text-button" onClick={() => setPanel('none')}>Keep playing</button>
        </div>
      )}

      {complete && (
        <div class="overlay">
          <div class="card panel" role="dialog" aria-label="Level complete">
            <p class="soft">{props.finishedNote}</p>
            <h2>Lovely.</h2>
            <p>
              {level.words.length} words{lp.bonus.length ? ` · ${lp.bonus.length} bonus` : ''}
              {earned !== null && (
                <>
                  {' · '}
                  <CoinIcon size={14} /> +{earned}
                </>
              )}
            </p>
            <button class="primary-button" onClick={props.onContinue}>Continue</button>
          </div>
        </div>
      )}
    </main>
  )
}
