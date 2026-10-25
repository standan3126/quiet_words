// Line icons drawn in currentColor. Emoji aren't used anywhere: their fixed colours
// include blue, which would break night mode.
import type { JSX } from 'preact'

const Svg = ({ children, size = 24 }: { children: JSX.Element | JSX.Element[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const ShuffleIcon = () => (
  <Svg>
    <path d="M4 7h3c4 0 6 10 10 10h3" />
    <path d="M4 17h3c1.6 0 2.8-1.6 3.9-3.6M13.1 9.6C14.2 7.6 15.4 7 17 7h3" />
    <path d="M18 4.5 20.5 7 18 9.5M18 14.5l2.5 2.5-2.5 2.5" />
  </Svg>
)

export const BulbIcon = () => (
  <Svg>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" />
  </Svg>
)

export const TargetIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Svg>
)

export const RocketIcon = () => (
  <Svg>
    <path d="M12 2.5c3 2 4.5 5.5 4.5 9.5l-2 4h-5l-2-4c0-4 1.5-7.5 4.5-9.5Z" />
    <circle cx="12" cy="9.5" r="1.6" />
    <path d="M7.5 12 5 15l2.5 1.5M16.5 12 19 15l-2.5 1.5M10.5 19l1.5 2.5 1.5-2.5" />
  </Svg>
)

export const CoinIcon = ({ size = 18 }: { size?: number }) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5c-2 2.5-2 6.5 0 9 2-2.5 2-6.5 0-9Z" />
  </Svg>
)

export const SparkleIcon = ({ size = 18 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />
  </Svg>
)

export const BackIcon = () => (
  <Svg>
    <path d="M15 5 8 12l7 7" />
  </Svg>
)

export const MoreIcon = () => (
  <Svg>
    <circle cx="6" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18" cy="12" r="1" fill="currentColor" />
  </Svg>
)

export const MoonIcon = () => (
  <Svg>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" />
  </Svg>
)

export const SunIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Svg>
)

export const ButterflyIcon = ({ size = 18 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M12 8c-1.5-3-6-5.5-7.5-3.5S5 11 9 11.5C6 12.5 5 16 7 17.5s4-1.5 5-4c1 2.5 3 5.5 5 4s1-5-2-6c4-.5 6-5 4.5-7S13.5 5 12 8Z" />
    <path d="M12 8v9" />
  </Svg>
)
