import { Logger } from '@aws-lambda-powertools/logger'
import { SesAdapter } from '../lib/sesAdapter'
import { OrderEvent } from '@order-platform/shared-types'
import { StatusCodes } from 'http-status-codes'

const logger = new Logger({ serviceName: 'notification-service' })
const sesAdapter = new SesAdapter()

export const handler = async (event: { Records: { body: string }[] }) => {
  for (const record of event.Records) {
    try {
      const raw: unknown = JSON.parse(record.body)
      if (!raw || typeof raw !== 'object' || !('type' in raw) || !('orderId' in raw)) {
        logger.error('Invalid message', { body: record.body })
        continue
      }

      const message = raw as OrderEvent

      if (message.type === 'order.created') {
        await sesAdapter.sendOrderCreatedEmail(message.orderId, message.total)
        logger.info('Order created notification sent', { orderId: message.orderId })
      } else if (message.type === 'order.updated') {
        await sesAdapter.sendOrderUpdatedEmail(message.orderId, message.status)
        logger.info('Order updated notification sent', { orderId: message.orderId })
      } else {
        logger.warn('Unknown event type', { type: (message as { type: string }).type })
      }
    } catch (error) {
      logger.error('Failed to process notification', { error })
    }
  }

  return { statusCode: StatusCodes.OK }
}
