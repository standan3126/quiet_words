// A three-question grammar or spelling break. Untimed; a wrong answer is gently corrected
// and still earns a coin.
import { useMemo, useState } from 'preact/hooks'
import { audio } from '../audio/engine'
import { COINS_QUIZ_RIGHT, COINS_QUIZ_TRY } from '../meta/progress'
import { CoinIcon } from '../ui/icons'
import { QUESTIONS, type Question } from './quiz-bank'

const PER_BREAK = 3

// A fixed shuffle of the bank, walked through in order, so nothing repeats until all are seen.
const ORDER = (() => {
  const order = QUESTIONS.map((_, i) => i)
  let seed = 7
  for (let i = order.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
})()

function questionAt(n: number): { q: Question; choices: string[] } {
  const index = ORDER[n % ORDER.length]
  const q = QUESTIONS[index]
  // Rotate the choices so the right one isn't always in the same place.
  const shift = (index * 7) % 3
  return { q, choices: [...q.choices.slice(shift), ...q.choices.slice(0, shift)] }
}

interface Props {
  start: number // position in the bank
  onDone: (coins: number, asked: number) => void
}

export function Quiz({ start, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [earned, setEarned] = useState(0)
  const { q, choices } = useMemo(() => questionAt(start + step), [start, step])
  const right = q.choices[0]
  const finished = step >= PER_BREAK

  const choose = (choice: string) => {
    if (chosen) return
    setChosen(choice)
    if (choice === right) audio.word()
    else audio.repeat()
    setEarned((e) => e + (choice === right ? COINS_QUIZ_RIGHT : COINS_QUIZ_TRY))
  }

  const next = () => {
    setChosen(null)
    setStep((s) => s + 1)
    if (step + 1 >= PER_BREAK) audio.levelComplete()
  }

  if (finished) {
    return (
      <main class="play break">
        <div class="card panel break-card" role="dialog" aria-label="Quiz complete">
          <p class="soft">A little word break</p>
          <h2>All done.</h2>
          <p>
            <CoinIcon size={14} /> +{earned}
          </p>
          <button class="primary-button" onClick={() => onDone(earned, PER_BREAK)}>
            Continue
          </button>
        </div>
      </main>
    )
  }

  const [before, after] = q.prompt.split('___')
  const isBlank = after !== undefined
  return (
    <main class="play break">
      <header class="break-header">
        <span class="soft">A little word break · {step + 1} of {PER_BREAK}</span>
        <button class="text-button" onClick={() => onDone(earned, step + (chosen ? 1 : 0))}>
          Skip
        </button>
      </header>
      <section class="card panel break-card" aria-label="Question">
        {isBlank ? (
          <p class="quiz-sentence">
            {before}
            <span class={`quiz-blank${chosen ? ' filled' : ''}`}>{chosen ? right : ' '}</span>
            {after}
          </p>
        ) : (
          <p class="quiz-sentence">{q.prompt}</p>
        )}
        <div class="quiz-choices">
          {choices.map((c) => {
            const state = !chosen ? '' : c === right ? 'right' : c === chosen ? 'wrong' : 'other'
            return (
              <button class={`quiz-choice ${state}`} onClick={() => choose(c)} disabled={!!chosen && c !== right && c !== chosen}>
                {c}
              </button>
            )
          })}
        </div>
        {chosen && (
          <div class="quiz-feedback" role="status">
            <p>{chosen === right ? "Lovely, that's right." : `The answer is "${right}".`}</p>
            {q.why && <p class="soft">{q.why}</p>}
            <button class="primary-button" onClick={next}>
              {step + 1 < PER_BREAK ? 'Next' : 'Finish'}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
