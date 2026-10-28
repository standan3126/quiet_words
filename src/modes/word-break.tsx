// The grammar and spelling games between levels: three untimed questions each. A wrong answer
// is gently corrected and still earns a coin.
import type { ComponentChildren } from 'preact'
import { useMemo, useState } from 'preact/hooks'
import { sound } from '../hub'
import { COINS_QUIZ_RIGHT, COINS_QUIZ_TRY } from '../meta/progress'
import { CoinIcon } from '../ui/icons'
import { GRAMMAR, SPELLING, type Question } from './quiz-bank'
import { bankIndex, MISTAKES, orderOf, PUNCTUATION, SENTENCES, SPEECH, type TapQuestion, type WordBreakKind } from './word-games-bank'

const PER_BREAK = 3

type Answer = (right: boolean, message?: string, why?: string) => void

// Pick one of three answers.
function ChoiceRound({ q, index, onAnswer }: { q: Question; index: number; onAnswer: Answer }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const right = q.choices[0]
  // Rotate the choices so the right one isn't always in the same place.
  const shift = (index * 7) % 3
  const choices = [...q.choices.slice(shift), ...q.choices.slice(0, shift)]
  const [before, after] = q.prompt.split('___')
  const choose = (c: string) => {
    if (chosen) return
    setChosen(c)
    onAnswer(c === right, c === right ? undefined : `The answer is "${right}".`, q.why)
  }
  return (
    <>
      {after !== undefined ? (
        <p class="quiz-sentence">
          {before}
          <span class={`quiz-blank${chosen ? ' filled' : ''}`}>{chosen ? right : ' '}</span>
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
    </>
  )
}

// Tap one word in a sentence: the mistake, or the verb, adjective or adverb.
function TapRound({ q, onAnswer }: { q: TapQuestion; onAnswer: Answer }) {
  const [tapped, setTapped] = useState<number | null>(null)
  const bare = (w: string) => w.replace(/[.,!?;:"]/g, '')
  const word = bare(q.words[q.answer])
  const choose = (i: number) => {
    if (tapped !== null) return
    setTapped(i)
    const right = i === q.answer
    const message = q.fix ? (right ? `Yes. It should be "${q.fix}".` : `It was "${word}". It should be "${q.fix}".`) : right ? undefined : `It was "${word}".`
    onAnswer(right, message, q.why)
  }
  return (
    <>
      <p class="soft tap-prompt">{q.prompt}</p>
      <p class="quiz-sentence tap-sentence">
        {q.words.map((w, i) => {
          const state = tapped === null ? '' : i === q.answer ? 'right' : i === tapped ? 'wrong' : ''
          // Once answered, a mistake shows the word that belongs there.
          const shown = state === 'right' && q.fix ? w.replace(word, q.fix) : w
          return (
            <button class={`tap-word ${state}`} onClick={() => choose(i)} disabled={tapped !== null}>
              {shown}
            </button>
          )
        })}
      </p>
    </>
  )
}

// Put a jumbled sentence back in order, one word at a time.
function BuildRound({ sentence, seed, onAnswer }: { sentence: string; seed: number; onAnswer: Answer }) {
  const words = sentence.split(' ')
  const jumbled = useMemo(() => {
    let order = orderOf(words.length, seed)
    // Never hand back the sentence already in order.
    if (order.every((w, i) => w === i)) order = [...order.slice(1), order[0]]
    return order
  }, [sentence, seed])
  const [placed, setPlaced] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const place = (i: number) => {
    if (done) return
    const next = [...placed, i]
    setPlaced(next)
    if (next.length < words.length) return sound.step(next.length - 1)
    setDone(true)
    // Compare the words, not their positions, so two "the"s can swap places.
    const right = next.map((j) => words[j]).join(' ') === sentence
    onAnswer(right, right ? undefined : `It reads: "${sentence}"`)
  }
  const unplace = (i: number) => !done && setPlaced(placed.filter((j) => j !== i))
  return (
    <>
      <p class="soft tap-prompt">Tap the words in order</p>
      <p class={`build-line${done ? ' done' : ''}`} aria-label="Your sentence">
        {placed.map((i) => (
          <button class="tap-word placed" onClick={() => unplace(i)} disabled={done}>
            {words[i]}
          </button>
        ))}
      </p>
      <p class="build-pool">
        {jumbled.map((i) =>
          placed.includes(i) ? null : (
            <button class="tap-word chip" onClick={() => place(i)}>
              {words[i]}
            </button>
          ),
        )}
      </p>
    </>
  )
}

const TITLES: Record<WordBreakKind, string> = {
  grammar: 'Fill the blank',
  spelling: 'Spelling',
  punctuation: 'Punctuation',
  mistake: 'Spot the mistake',
  speech: 'Parts of speech',
  unscramble: 'Sentence builder',
}

function round(kind: WordBreakKind, n: number, onAnswer: Answer): ComponentChildren {
  const index = bankIndex(kind, n)
  switch (kind) {
    case 'grammar':
      return <ChoiceRound q={GRAMMAR[index]} index={index} onAnswer={onAnswer} />
    case 'spelling':
      return <ChoiceRound q={SPELLING[index]} index={index} onAnswer={onAnswer} />
    case 'punctuation':
      return <ChoiceRound q={PUNCTUATION[index]} index={index} onAnswer={onAnswer} />
    case 'mistake':
      return <TapRound q={MISTAKES[index]} onAnswer={onAnswer} />
    case 'speech':
      return <TapRound q={SPEECH[index]} onAnswer={onAnswer} />
    case 'unscramble':
      return <BuildRound sentence={SENTENCES[index]} seed={index + 1} onAnswer={onAnswer} />
  }
}

interface Props {
  kind: WordBreakKind
  start: number // position in this game's questions
  onDone: (coins: number, asked: number) => void
}

export function WordBreak({ kind, start, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<{ right: boolean; message?: string; why?: string } | null>(null)
  const [earned, setEarned] = useState(0)
  const title = TITLES[kind]

  const answer: Answer = (right, message, why) => {
    setResult({ right, message, why })
    if (right) sound.chime()
    else sound.soft()
    setEarned((e) => e + (right ? COINS_QUIZ_RIGHT : COINS_QUIZ_TRY))
  }

  const next = () => {
    setResult(null)
    setStep((s) => s + 1)
    if (step + 1 >= PER_BREAK) sound.celebrate()
  }

  if (step >= PER_BREAK) {
    return (
      <main class="play break">
        <div class="card panel break-card" role="dialog" aria-label={`${title} complete`}>
          <p class="soft">{title}</p>
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

  return (
    <main class="play break">
      <header class="break-header">
        <span class="soft">
          {title} · {step + 1} of {PER_BREAK}
        </span>
        <button class="text-button" onClick={() => onDone(earned, step + (result ? 1 : 0))}>
          Skip
        </button>
      </header>
      <section class="card panel break-card" aria-label="Question" key={step}>
        {round(kind, start + step, answer)}
        {result && (
          <div class="quiz-feedback" role="status">
            <p>{result.message ?? "Lovely, that's right."}</p>
            {result.why && <p class="soft">{result.why}</p>}
            <button class="primary-button" onClick={next}>
              {step + 1 < PER_BREAK ? 'Next' : 'Finish'}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
