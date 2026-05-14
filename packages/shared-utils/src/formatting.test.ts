import { describe, it, expect } from 'vitest'
import { formatCurrency, formatTimestamp } from './formatting'
import { ValidationError } from './errors'

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe('formatCurrency', () => {
  it('formats a whole number in USD by default', () => {
    const result = formatCurrency(100)
    expect(result).toBe('$100.00')
  })

  it('formats a decimal amount', () => {
    const result = formatCurrency(49.99)
    expect(result).toBe('$49.99')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toBe('$0.00')
  })

  it('formats with a custom currency code', () => {
    const result = formatCurrency(10, 'EUR')
    expect(result).toContain('10')
  })

  it('formats large numbers', () => {
    const result = formatCurrency(1234567.89)
    expect(result).toContain('1,234,567.89')
  })

  it('throws ValidationError for NaN', () => {
    expect(() => formatCurrency(NaN)).toThrow(ValidationError)
  })

  it('throws ValidationError for Infinity', () => {
    expect(() => formatCurrency(Infinity)).toThrow(ValidationError)
    expect(() => formatCurrency(-Infinity)).toThrow(ValidationError)
  })

  it('throws ValidationError for negative amounts', () => {
    expect(() => formatCurrency(-50)).toThrow(ValidationError)
  })

  it('throws ValidationError for non-number values', () => {
    expect(() => formatCurrency(null as unknown as number)).toThrow(ValidationError)
    expect(() => formatCurrency(undefined as unknown as number)).toThrow(ValidationError)
  })
})

// ---------------------------------------------------------------------------
// formatTimestamp
// ---------------------------------------------------------------------------
describe('formatTimestamp', () => {
  it('formats a Date object', () => {
    const date = new Date('2026-05-12T15:45:00Z')
    const result = formatTimestamp(date)
    expect(result).toContain('2026')
    expect(result).toContain('May')
  })

  it('formats an ISO 8601 string', () => {
    const result = formatTimestamp('2026-05-12T15:45:00Z')
    expect(result).toContain('2026')
    expect(result).toContain('May')
  })

  it('throws ValidationError for an invalid date string', () => {
    expect(() => formatTimestamp('not-a-date')).toThrow(ValidationError)
  })

  it('throws ValidationError for an invalid Date object', () => {
    expect(() => formatTimestamp(new Date('invalid'))).toThrow(ValidationError)
  })

  it('throws ValidationError for null or undefined', () => {
    expect(() => formatTimestamp(null as unknown as Date)).toThrow(ValidationError)
    expect(() => formatTimestamp(undefined as unknown as Date)).toThrow(ValidationError)
  })
})
