import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import type { Order } from '@order-platform/shared-types'

function toOrder(item: Record<string, unknown>): Order {
  return {
    id: String(item.id),
    item: String(item.item),
    amount: Number(item.amount),
    status: item.status as Order['status'],
    createdAt: String(item.createdAt),
    updatedAt: String(item.updatedAt),
  }
}

export class OrderRepository {
  constructor(
    private readonly tableName: string,
    private readonly client: DynamoDBClient,
  ) {}

  async create(order: Order): Promise<void> {
    const putCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        pk: `order#${order.id}`,
        sk: 'metadata',
        ...order,
      }),
      ConditionExpression: `attribute_not_exists(pk)`,
    })
    await this.client.send(putCommand)
  }

  async getById(id: string): Promise<Order | null> {
    const getCommand = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({
        pk: `order#${id}`,
        sk: 'metadata',
      }),
    })

    const result = await this.client.send(getCommand)

    if (!result.Item) {
      return null
    }

    const item = unmarshall(result.Item)

    return toOrder(item)
  }

  async list(): Promise<Order[]> {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'sk = :metadata',
      ExpressionAttributeValues: marshall({ ':metadata': 'metadata' }),
    })

    const result = await this.client.send(scanCommand)

    return (result.Items ?? []).map((item) => toOrder(unmarshall(item)))
  }
}
