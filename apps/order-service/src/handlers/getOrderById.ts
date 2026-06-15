import { APIGatewayProxyEvent } from 'aws-lambda'
import { jsonResponse } from '../lib/httpResponse'
import { Logger } from '@aws-lambda-powertools/logger'
import { OrderRepository } from '../lib/orderRepository'
import { dynamoClient } from '../lib/dynamodb'
import { StatusCodes } from 'http-status-codes'

const logger = new Logger({ serviceName: 'order-service' })
const tableName = process.env.ORDERS_TABLE ?? ''
const repository = new OrderRepository(tableName, dynamoClient)

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.logEventIfEnabled(event)
  const id = event.pathParameters?.id
  if (!id) {
    return jsonResponse(StatusCodes.BAD_REQUEST, { message: 'Missing order id' })
  }

  try {
    const order = await repository.getById(id)
    if (!order) {
      return jsonResponse(StatusCodes.NOT_FOUND, { message: `Order ${id} not found` })
    }

    return jsonResponse(StatusCodes.OK, { order })
  } catch (error) {
    logger.error(`Failed to get order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, { message: 'Failed to get order' })
  }
}
