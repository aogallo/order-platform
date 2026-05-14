import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import type { OrderStatus, TrackingEntry } from '@order-platform/shared-types'

export class TrackingRepository {
  constructor(
    private readonly tableName: string,
    private readonly client: DynamoDBClient,
  ) {}

  async getTracking(orderId: string): Promise<TrackingEntry[]> {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: marshall({ ':pk': `tracking#${orderId}` }),
    })
    const result = await this.client.send(queryCommand)

    const items = result?.Items
    if (!items || items.length === 0) return []

    return items.map((item) => {
      const entry = unmarshall(item) as {
        pk: string
        sk: string
        status: string
        updatedBy: string
      }
      return {
        orderId,
        status: entry.status as OrderStatus,
        timestamp: entry.sk,
        updatedBy: entry.updatedBy,
      } as TrackingEntry
    })
  }

  async addEntry(orderId: string, payload: Omit<TrackingEntry, 'orderId'>) {
    const putItem = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        pk: `tracking#${orderId}`,
        sk: payload.timestamp,
        status: payload.status,
        updatedBy: payload.updatedBy,
      }),
    })

    await this.client.send(putItem)
  }
}
