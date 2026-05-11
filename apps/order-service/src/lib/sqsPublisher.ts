import { Logger } from '@aws-lambda-powertools/logger'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'

const client = new SQSClient({})
const logger = new Logger({ serviceName: 'order-service' })

export async function publishOrderCreated(event: {
  orderId: string
  total: number
}): Promise<void> {
  const queueUrl = process.env.SQS_QUEUE_URL
  if (!queueUrl) {
    logger.warn('SQS_QUEUE_URL not set - skipping publish')
    return
  }

  try {
    await client.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
          type: 'order.created',
          orderId: event.orderId,
          total: event.total,
        }),
      }),
    )
    logger.info('OrderCreated event published to SQS', { orderId: event.orderId })
  } catch (error) {
    logger.error('Failed to publish OrderCreated event', { error })
  }
}
