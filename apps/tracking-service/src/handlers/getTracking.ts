import { Logger } from '@aws-lambda-powertools/logger'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { TrackingRepository } from '../lib/trackingRepository'
import { client } from '../lib/dynamodb'
import { StatusCodes } from 'http-status-codes'

const logger = new Logger({ serviceName: 'tracking-service' })
const tableName = process.env.TRACKING_TABLE ?? ''

export const handler = async (event: APIGatewayProxyEvent) => {
  const orderId = event.pathParameters?.id

  if (!orderId) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({ message: 'Missing Order ID' }),
    }
  }

  const repo = new TrackingRepository(tableName, client)
  const entries = await repo.getTracking(orderId)

  if (entries.length === 0) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      body: JSON.stringify({ message: `No tracking data found for order ${orderId}` }),
    }
  }

  logger.info('Tracking data retrieved', { orderId, count: entries.length })

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({ orderId, entries }),
  }
}
