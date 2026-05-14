import { describe, it, expect } from 'vitest'
import { ORDER_STATUSES, USER_GROUPS, VALID_ORDER_EVENT_TYPES } from './constants'

describe('ORDER_STATUSES', () => {
  it('contains all five order lifecycle statuses', () => {
    expect(ORDER_STATUSES).toEqual([
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ])
  })

  it('is frozen (readonly)', () => {
    expect(Object.isFrozen(ORDER_STATUSES)).toBe(true)
  })

  it('contains no duplicate values', () => {
    const unique = new Set(ORDER_STATUSES)
    expect(unique.size).toBe(ORDER_STATUSES.length)
  })
})

describe('USER_GROUPS', () => {
  it('contains all three user groups', () => {
    expect(USER_GROUPS).toEqual(['admin', 'operator', 'viewer'])
  })

  it('is frozen (readonly)', () => {
    expect(Object.isFrozen(USER_GROUPS)).toBe(true)
  })
})

describe('VALID_ORDER_EVENT_TYPES', () => {
  it('contains the two registered event types', () => {
    expect(VALID_ORDER_EVENT_TYPES).toEqual(['order.created', 'order.updated'])
  })

  it('is frozen (readonly)', () => {
    expect(Object.isFrozen(VALID_ORDER_EVENT_TYPES)).toBe(true)
  })
})
