import { Logger } from '@aws-lambda-powertools/logger'
import { publishOrderCreated } from '../lib/sqsPublisher'
import { jsonResponse } from '../lib/httpResponse'

type OrderCreateEvent = {
  id: string
  amount: number
  item: string
}

const logger = new Logger({ serviceName: 'order-service' })

export const handler = async (event: OrderCreateEvent) => {
  logger.logEventIfEnabled(event)
  try {
    logger.info('Order is validated')
    logger.info('Order is created', { data: event })
    await publishOrderCreated({ orderId: event.id, total: event.amount })
    const response = jsonResponse(201, {
      message: 'Order created',
      data: event,
    })
    return response
  } catch (error) {
    console.error(
      `Failed to process order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    throw error
  }
}
