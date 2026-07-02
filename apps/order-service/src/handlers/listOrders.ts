import { Logger } from '@aws-lambda-powertools/logger'
import { OrderRepository } from '../lib/orderRepository'
import { dynamoClient } from '../lib/dynamodb'
import type { ListOrdersResponse } from '@order-platform/shared-types'
import { jsonResponse } from '../lib/httpResponse'
import { StatusCodes } from 'http-status-codes'

const logger = new Logger({ serviceName: 'order-service' })
const tableName = process.env.ORDERS_TABLE ?? ''
const repository = new OrderRepository(tableName, dynamoClient)

export const handler = async () => {
  try {
    logger.info('Listing orders')

    const orders = await repository.list()
    const response: ListOrdersResponse = { orders }
    return jsonResponse(StatusCodes.OK, response)
  } catch (error) {
    logger.error(
      `Failed to list orders: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )

    return jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, { message: 'Failed to list orders' })
  }
}
