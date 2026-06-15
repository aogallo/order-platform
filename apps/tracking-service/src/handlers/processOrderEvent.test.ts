import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { StatusCodes } from 'http-status-codes'

vi.mock('../lib/dynamodb', () => ({
  client: new DynamoDBClient({}),
}))

const mockSend = vi.fn()

vi.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(mockSend)

const { handler } = await import('./processOrderEvent')

function makeSqsEvent(body: unknown) {
  return { Records: [{ body: JSON.stringify(body) }] } as any
}

describe('processOrderEvent', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('creates PENDING entry on order.created event', async () => {
    mockSend.mockResolvedValue({})

    const result = await handler(makeSqsEvent({ type: 'order.created', orderId: 'order-123' }))

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).toHaveBeenCalledTimes(1)

    const command = mockSend.mock.calls[0][0]
    expect(command).toBeInstanceOf(PutItemCommand)
    expect(command.input.Item?.pk.S).toBe('tracking#order-123')
    expect(command.input.Item?.status.S).toBe('PENDING')
  })

  it('creates entry with event status on order.updated event', async () => {
    mockSend.mockResolvedValue({})

    const result = await handler(
      makeSqsEvent({ type: 'order.updated', orderId: 'order-456', status: 'CONFIRMED' }),
    )

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).toHaveBeenCalledTimes(1)

    const command = mockSend.mock.calls[0][0]
    expect(command).toBeInstanceOf(PutItemCommand)
    expect(command.input.Item?.pk.S).toBe('tracking#order-456')
    expect(command.input.Item?.status.S).toBe('CONFIRMED')
  })

  it('skips message missing required fields', async () => {
    const result = await handler(makeSqsEvent({ orderId: 'order-123' })) // no 'type'

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('skips unknown event type', async () => {
    const result = await handler(makeSqsEvent({ type: 'order.cancelled', orderId: 'order-123' }))

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('handles malformed JSON gracefully', async () => {
    const event = { Records: [{ body: 'not-json' }] } as any
    const result = await handler(event)

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('processes multiple records in a single event', async () => {
    mockSend.mockResolvedValue({})

    const event = {
      Records: [
        { body: JSON.stringify({ type: 'order.created', orderId: 'order-1' }) },
        {
          body: JSON.stringify({ type: 'order.updated', orderId: 'order-2', status: 'DELIVERED' }),
        },
      ],
    } as any

    const result = await handler(event)

    expect(result.statusCode).toBe(StatusCodes.OK)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })
})
