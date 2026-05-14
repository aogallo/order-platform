import { describe, it, expect } from 'vitest'
import { createOrderCreatedEvent, createOrderUpdatedEvent } from './event'
import { ValidationError } from './errors'
import { ORDER_STATUSES } from './constants'

// ---------------------------------------------------------------------------
// SCENARIO-5: Event factory produces valid payload
// ---------------------------------------------------------------------------
describe('createOrderCreatedEvent', () => {
  it('returns a valid OrderCreatedEvent with correct shape', () => {
    const event = createOrderCreatedEvent('ord-abc123', 49.99)

    expect(event).toEqual({
      type: 'order.created',
      orderId: 'ord-abc123',
      total: 49.99,
    })
  })

  it('sets type to "order.created"', () => {
    const event = createOrderCreatedEvent('ord-1', 10)
    expect(event.type).toBe('order.created')
  })

  it('sets total to the provided value (matching JSON Schema field name)', () => {
    const event = createOrderCreatedEvent('ord-1', 99.95)
    // NOTE: field is `total` not `amount` — matches JSON Schema + Python Pydantic
    expect(event.total).toBe(99.95)
  })

  it('throws ValidationError for an invalid orderId', () => {
    expect(() => createOrderCreatedEvent('', 10)).toThrow(ValidationError)
    expect(() => createOrderCreatedEvent('bad-id', 10)).toThrow(ValidationError)
  })

  it('throws ValidationError for an invalid total', () => {
    expect(() => createOrderCreatedEvent('ord-1', NaN)).toThrow(ValidationError)
    expect(() => createOrderCreatedEvent('ord-1', 0)).toThrow(ValidationError)
    expect(() => createOrderCreatedEvent('ord-1', -5)).toThrow(ValidationError)
  })
})

describe('createOrderUpdatedEvent', () => {
  it('returns a valid OrderUpdatedEvent with correct shape', () => {
    const event = createOrderUpdatedEvent('ord-abc123', 'SHIPPED')

    expect(event).toEqual({
      type: 'order.updated',
      orderId: 'ord-abc123',
      status: 'SHIPPED',
    })
  })

  it('accepts every known OrderStatus', () => {
    for (const status of ORDER_STATUSES) {
      const event = createOrderUpdatedEvent('ord-1', status)
      expect(event.status).toBe(status)
    }
  })

  it('throws ValidationError for an invalid orderId', () => {
    expect(() => createOrderUpdatedEvent('', 'PENDING')).toThrow(ValidationError)
    expect(() => createOrderUpdatedEvent('bad-id', 'PENDING')).toThrow(ValidationError)
  })

  it('throws ValidationError for an invalid status', () => {
    expect(() =>
      createOrderUpdatedEvent('ord-1', 'UNKNOWN' as never),
    ).toThrow(ValidationError)
  })
})
