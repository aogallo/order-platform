import { Logger } from '@aws-lambda-powertools/logger'

import { TrackingEntry, OrderEvent } from '@order-platform/shared-types'
import { TrackingRepository } from '../lib/trackingRepository'
import { client } from '../lib/dynamodb'
import { StatusCodes } from 'http-status-codes'

const logger = new Logger({ serviceName: 'tracking-service' })
const tableName = process.env.TRACKING_TABLE ?? ''

export const handler = async (event: { Records: { body: string }[] }) => {
  for (const record of event.Records) {
    try {
      const raw: unknown = JSON.parse(record.body)

      // validation
      if (!raw || typeof raw !== 'object' || !('type' in raw) || !('orderId' in raw)) {
        logger.error('Invalid message', { body: record.body })
        continue
      }

      const message = raw as OrderEvent

      let status: TrackingEntry['status']
      const updatedBy = 'order-service'

      if (message.type === 'order.created') {
        status = 'PENDING'
      } else if (message.type === 'order.updated') {
        status = message.status
      } else {
        logger.error('Unknown event type', { type: (message as OrderEvent).type })
        continue
      }

      const repo = new TrackingRepository(tableName, client)
      await repo.addEntry(message.orderId, {
        status,
        timestamp: new Date().toISOString(),
        updatedBy,
      })
      logger.info('Tracking entry added', { orderId: message.orderId, status })
    } catch (error) {
      logger.error('Failed to process event', { error })
    }
  }

  return { statusCode: StatusCodes.OK }
}
