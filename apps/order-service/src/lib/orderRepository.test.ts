import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { Order } from '@order-platform/shared-types'
import { OrderRepository } from './orderRepository'

const mockSend = vi.fn()

vi.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(mockSend)

const order: Order = {
  id: 'order-123',
  item: 'Wireless Mouse',
  amount: 45.99,
  status: 'PENDING',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('OrderRepository', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('creates an order item', async () => {
    mockSend.mockResolvedValue({})
    const repository = new OrderRepository('orders-table', new DynamoDBClient({}))

    await repository.create(order)

    const command = mockSend.mock.calls[0]?.[0]
    expect(command).toBeInstanceOf(PutItemCommand)

    if (!(command instanceof PutItemCommand)) {
      throw new Error('Expected PutItemCommand')
    }

    expect(command.input.TableName).toBe('orders-table')
    expect(command.input.ConditionExpression).toBe('attribute_not_exists(pk)')
    expect(command.input.Item?.pk.S).toBe('order#order-123')
    expect(command.input.Item?.sk.S).toBe('metadata')
  })

  it('gets an order by id', async () => {
    mockSend.mockResolvedValue({
      Item: {
        pk: { S: 'order#order-123' },
        sk: { S: 'metadata' },
        id: { S: order.id },
        item: { S: order.item },
        amount: { N: String(order.amount) },
        status: { S: order.status },
        createdAt: { S: order.createdAt },
        updatedAt: { S: order.updatedAt },
      },
    })

    const repository = new OrderRepository('orders-table', new DynamoDBClient({}))

    const result = await repository.getById('order-123')
    expect(result).toEqual(order)
  })

  it('returns null when order does not exist', async () => {
    mockSend.mockResolvedValue({})
    const repository = new OrderRepository('orders-table', new DynamoDBClient({}))
    const result = await repository.getById('missing-order')
    expect(result).toBeNull()
  })

  it('lists order metadata items', async () => {
    mockSend.mockResolvedValue({
      Items: [
        {
          pk: { S: 'order#ord-123' },
          sk: { S: 'metadata' },
          id: { S: order.id },
          item: { S: order.item },
          amount: { N: String(order.amount) },
          status: { S: order.status },
          createdAt: { S: order.createdAt },
          updatedAt: { S: order.updatedAt },
        },
      ],
    })

    const repository = new OrderRepository('orders-table', new DynamoDBClient({}))
    const result = await repository.list()

    const command = mockSend.mock.calls[0]?.[0]
    expect(command).toBeInstanceOf(ScanCommand)

    expect(result).toEqual([order])
  })
})
