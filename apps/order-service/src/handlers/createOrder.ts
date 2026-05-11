import { Logger } from '@aws-lambda-powertools/logger'
import { publishOrderCreated } from '../lib/sqsPublisher'

type OrderCreateEvent = {
  id: string
  amount: number
  item: string
}

type Response = {
  statusCode: number
  body: { message: string; data: OrderCreateEvent }
}

const logger = new Logger({ serviceName: 'order-service' })

export const handler = async (event: OrderCreateEvent): Promise<Response> => {
  logger.logEventIfEnabled(event)
  try {
    logger.info('Order is validated')
    logger.info('Order is created', { data: event })
    await publishOrderCreated({ orderId: event.id, total: event.amount })
    return {
      statusCode: 201,
      body: { message: 'Order created', data: event },
    }
  } catch (error) {
    console.error(
      `Failed to process order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    throw error
  }
}
