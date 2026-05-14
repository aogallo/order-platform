import { describe, it, expect } from 'vitest'
import { isValidOrderId, isValidAmount, isValidOrderStatus } from './validation'
import { ORDER_STATUSES } from './constants'

// ---------------------------------------------------------------------------
// isValidOrderId
// ---------------------------------------------------------------------------
describe('isValidOrderId', () => {
  it('returns true for a valid order ID', () => {
    expect(isValidOrderId('ord-abc123')).toBe(true)
    expect(isValidOrderId('ord-ABC')).toBe(true)
    expect(isValidOrderId('ord-1')).toBe(true)
  })

  it('returns false for an empty string', () => {
    expect(isValidOrderId('')).toBe(false)
  })

  it('returns false for a malformed ID without ord- prefix', () => {
    expect(isValidOrderId('order-123')).toBe(false)
    expect(isValidOrderId('ord-')).toBe(false)
    expect(isValidOrderId('abc-123')).toBe(false)
    expect(isValidOrderId('123')).toBe(false)
  })

  it('returns false for a string with special characters', () => {
    expect(isValidOrderId('ord-abc_123')).toBe(false)
    expect(isValidOrderId('ord-abc-123')).toBe(false)
    expect(isValidOrderId('ord-$money')).toBe(false)
  })

  it('returns false for non-string values', () => {
    expect(isValidOrderId(null as unknown as string)).toBe(false)
    expect(isValidOrderId(undefined as unknown as string)).toBe(false)
    expect(isValidOrderId(123 as unknown as string)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isValidAmount
// ---------------------------------------------------------------------------
describe('isValidAmount', () => {
  it('returns true for positive finite numbers', () => {
    expect(isValidAmount(1)).toBe(true)
    expect(isValidAmount(49.99)).toBe(true)
    expect(isValidAmount(0.01)).toBe(true)
    expect(isValidAmount(Number.MAX_SAFE_INTEGER)).toBe(true)
  })

  it('returns false for zero', () => {
    expect(isValidAmount(0)).toBe(false)
  })

  it('returns false for negative numbers', () => {
    expect(isValidAmount(-1)).toBe(false)
    expect(isValidAmount(-0.01)).toBe(false)
  })

  it('returns false for NaN', () => {
    expect(isValidAmount(NaN)).toBe(false)
  })

  it('returns false for Infinity', () => {
    expect(isValidAmount(Infinity)).toBe(false)
    expect(isValidAmount(-Infinity)).toBe(false)
  })

  it('returns false for non-number values', () => {
    expect(isValidAmount(null as unknown as number)).toBe(false)
    expect(isValidAmount(undefined as unknown as number)).toBe(false)
    expect(isValidAmount('49.99' as unknown as number)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isValidOrderStatus
// ---------------------------------------------------------------------------
describe('isValidOrderStatus', () => {
  it('returns true for every known OrderStatus', () => {
    for (const status of ORDER_STATUSES) {
      expect(isValidOrderStatus(status)).toBe(true)
    }
  })

  it('type-narrows to OrderStatus when true', () => {
    const input: string = 'PENDING'
    if (isValidOrderStatus(input)) {
      // Compile-time check: input should be narrowed to OrderStatus
      const _narrowed: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' = input
      expect(_narrowed).toBe('PENDING')
    }
  })

  it('returns false for an unknown status string', () => {
    expect(isValidOrderStatus('UNKNOWN')).toBe(false)
    expect(isValidOrderStatus('pending')).toBe(false) // case-sensitive
    expect(isValidOrderStatus('')).toBe(false)
  })

  it('returns false for non-string values', () => {
    expect(isValidOrderStatus(null as unknown as string)).toBe(false)
    expect(isValidOrderStatus(undefined as unknown as string)).toBe(false)
    expect(isValidOrderStatus(42 as unknown as string)).toBe(false)
  })
})
