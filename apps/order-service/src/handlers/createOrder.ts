import { Logger } from '@aws-lambda-powertools/logger'

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

export const createOrder = async (event: OrderCreateEvent): Promise<Response> => {
  try {
    logger.info('Order is validated')
    logger.info('Order is created')
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
