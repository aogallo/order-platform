import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { StatusCodes } from 'http-status-codes'

vi.mock('../lib/dynamodb', () => ({
  dynamoClient: new DynamoDBClient({}),
}))

const mockSend = vi.fn()

vi.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(mockSend)

const { handler } = await import('./listOrders')

describe('ListOrders', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('returns 200 with listed orders', async () => {
    mockSend.mockResolvedValue({
      Items: [
        {
          pk: { S: 'order#order-123' },
          sk: { S: 'metadata' },
          id: { S: 'order-123' },
          item: { S: 'Wireless Mouse' },
          amount: { N: '45.99' },
          status: { S: 'PENDING' },
          createdAt: { S: '2026-01-01T00:00:00Z' },
          updatedAt: { S: '2026-01-01T00:00:00Z' },
        },
      ],
    })

    const result = await handler()

    expect(result.statusCode).toBe(StatusCodes.OK)
    const body = JSON.parse(result.body)
    expect(body.orders).toEqual([
      {
        id: 'order-123',
        item: 'Wireless Mouse',
        amount: 45.99,
        status: 'PENDING',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ])
  })

  it('returns 500 when listing orders fails', async () => {
    mockSend.mockRejectedValue(new Error('DynamoDB unavailable'))

    const result = await handler()

    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    const body = JSON.parse(result.body)
    expect(body.message).toBe('Failed to list orders')
  })
})
