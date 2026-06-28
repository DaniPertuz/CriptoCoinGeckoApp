import { describe, expect, it } from 'vitest'

import { formatPercent, percentageClass } from './formatters'

describe('formatters', () => {
  it('formats null percentages as unavailable', () => {
    expect(formatPercent(null)).toBe('N/D')
  })

  it('returns semantic classes for positive and negative percentages', () => {
    expect(percentageClass(1)).toContain('emerald')
    expect(percentageClass(-1)).toContain('rose')
  })
})
