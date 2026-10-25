// Pressed flowers for finished daily puzzles. The kind and colour come from the date, so
// each day's flower is its own. Night colours contain no blue.

const KINDS = ['daisy', 'tulip', 'poppy', 'lavender', 'bellflower'] as const
const DAY_COLORS = ['#e9a3b5', '#f2c14e', '#e2725b', '#a98bd0', '#f7f2e8', '#8fb3d9', '#f0a868']
const NIGHT_COLORS = ['#d07800', '#e09a00', '#b05000', '#f0b000', '#c86400']

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

export function PressedFlower({ date, night }: { date: string; night: boolean }) {
  const h = hash(date)
  const kind = KINDS[h % KINDS.length]
  const colors = night ? NIGHT_COLORS : DAY_COLORS
  const petal = colors[(h >>> 4) % colors.length]
  const stem = night ? '#7a4000' : '#7d9a6a'
  const heart = night ? '#ffc000' : '#e8c040'
  const tilt = ((h >>> 8) % 30) - 15

  return (
    <svg viewBox="0 0 60 90" class="pressed-flower" style={{ transform: `rotate(${tilt}deg)` }} aria-hidden="true">
      <path d="M30,88 C28,70 33,55 30,40" stroke={stem} stroke-width="2" fill="none" />
      <path d="M30,68 C22,62 18,64 15,58 C22,56 27,60 30,66" fill={stem} opacity="0.8" />
      {kind === 'daisy' && (
        <g transform="translate(30,32)">
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse rx="3.2" ry="11" cy="-10" fill={petal} transform={`rotate(${i * 30})`} opacity="0.9" />
          ))}
          <circle r="5" fill={heart} />
        </g>
      )}
      {kind === 'tulip' && <path d="M19,22 C19,40 41,40 41,22 L36,30 L30,18 L24,30 Z" fill={petal} transform="translate(0,6)" />}
      {kind === 'poppy' && (
        <g transform="translate(30,32)">
          {[0, 90, 180, 270].map((a) => (
            <circle r="9" cx="7" fill={petal} transform={`rotate(${a})`} opacity="0.85" />
          ))}
          <circle r="4" fill={night ? '#3a1a00' : '#3a3030'} />
        </g>
      )}
      {kind === 'lavender' &&
        Array.from({ length: 7 }, (_, i) => <ellipse cx={30 + (i % 2 ? 3 : -3)} cy={12 + i * 5} rx="3" ry="4" fill={petal} />)}
      {kind === 'bellflower' &&
        [-1, 1].map((side) => (
          <path d={`M30,${30 + side * 0} c${side * 4},-2 ${side * 12},2 ${side * 13},12 c${side * -2},4 ${side * -8},5 ${side * -11},2 Z`} fill={petal} transform={`translate(0,${side > 0 ? 6 : -4})`} />
        ))}
    </svg>
  )
}
