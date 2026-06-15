import { Logger } from '@aws-lambda-powertools/logger'
import { publishOrderCreated } from '../lib/sqsPublisher'
import { jsonResponse } from '../lib/httpResponse'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { z } from 'zod'
import { StatusCodes } from 'http-status-codes'
import type { CreateOrderRequest, Order } from '@order-platform/shared-types'
import { OrderRepository } from '../lib/orderRepository'
import { dynamoClient } from '../lib/dynamodb'

const CreateOrderSchema = z.object({
  item: z.string().min(1),
  amount: z.number().positive(),
})

const logger = new Logger({ serviceName: 'order-service' })
const tableName = process.env.ORDERS_TABLE ?? ''
const repository = new OrderRepository(tableName, dynamoClient)

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.logEventIfEnabled(event)
  let rawPayload: unknown

  try {
    rawPayload = JSON.parse(event.body ?? '{}')
  } catch {
    return jsonResponse(StatusCodes.BAD_REQUEST, { message: 'Invalid Request' })
  }

  const parsed = CreateOrderSchema.safeParse(rawPayload)

  if (!parsed.success) {
    return jsonResponse(StatusCodes.BAD_REQUEST, { message: 'Invalid order payload' })
  }

  const payload: CreateOrderRequest = parsed.data
  const now = new Date().toISOString()
  const order: Order = {
    id: `ord-${crypto.randomUUID().replace(/-/g, '')}`,
    item: payload.item,
    amount: payload.amount,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }

  try {
    logger.info('Creating order')
    await repository.create(order)
    logger.info('Order is created', { data: order })
    await publishOrderCreated({ orderId: order.id, total: order.amount })
    const response = jsonResponse(StatusCodes.CREATED, {
      message: 'Order is created',
      data: order,
    })
    return response
  } catch (error) {
    console.error(
      `Failed to process order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    return jsonResponse(StatusCodes.INTERNAL_SERVER_ERROR, { message: 'Failed to create order' })
  }
}
