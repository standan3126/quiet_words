import { describe, expect, it } from 'vitest'
import { defaultSettings, isNightTime, resolveTheme } from './settings'

const at = (h: number, m = 0) => new Date(2026, 9, 24, h, m)

describe('night window', () => {
  it('wraps past midnight', () => {
    expect(isNightTime(defaultSettings, at(21))).toBe(true)
    expect(isNightTime(defaultSettings, at(2))).toBe(true)
    expect(isNightTime(defaultSettings, at(7))).toBe(false)
    expect(isNightTime(defaultSettings, at(12))).toBe(false)
    expect(isNightTime(defaultSettings, at(19, 59))).toBe(false)
  })

  it('handles a same-day window', () => {
    const s = { ...defaultSettings, nightStart: '13:00', nightEnd: '15:00' }
    expect(isNightTime(s, at(14))).toBe(true)
    expect(isNightTime(s, at(16))).toBe(false)
  })

  it('manual mode overrides the clock', () => {
    expect(resolveTheme({ ...defaultSettings, themeMode: 'day' }, at(23))).toBe('day')
    expect(resolveTheme({ ...defaultSettings, themeMode: 'night' }, at(12))).toBe('night')
  })
})
