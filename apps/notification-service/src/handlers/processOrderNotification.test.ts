import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { mockClient } from 'aws-sdk-client-mock'
import { beforeEach, describe, expect, it } from 'vitest'
import { handler } from './processOrderNotification'

const sesMock = mockClient(SESClient)

function makeRecord(body: object) {
  return { body: JSON.stringify(body) }
}

describe('processOrderNotification handler', () => {
  beforeEach(() => {
    sesMock.reset()
    process.env.SES_FROM_ADDRESS = 'test@example.com'
  })

  it('sends order created email on order.created event', async () => {
    sesMock.on(SendEmailCommand).resolves({})

    await handler({
      Records: [makeRecord({ type: 'order.created', orderId: 'ord1-2', total: 60 })],
    })

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input.Message?.Subject?.Data).toBe('Order ord1-2 received')
  })

  it('sends order updated email on order.updated event', async () => {
    sesMock.on(SendEmailCommand).resolves({})
    await handler({
      Records: [makeRecord({ type: 'order.updated', orderId: 'ord-2', status: 'SHIPPED' })],
    })

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input.Message?.Subject?.Data).toBe('Order ord-2 status update')
  })

  it('skips invalid messages without throwing', async () => {
    sesMock.on(SendEmailCommand).resolves({})
    await handler({
      Records: [makeRecord({ invalid: true })],
    })

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls).toHaveLength(0)
  })

  it('skips unknown event types without throwing', async () => {
    sesMock.on(SendEmailCommand).resolves({})
    await handler({
      Records: [makeRecord({ type: 'order.cancelled', orderId: 'ord-8' })],
    })

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls).toHaveLength(0)
  })

  it('processes multiple records independently', async () => {
    sesMock.on(SendEmailCommand).resolves({})
    await handler({
      Records: [
        makeRecord({ type: 'order.created', orderId: 'ord-83', total: 11.11 }),
        makeRecord({ type: 'order.updated', orderId: 'ord-88', status: 'DELIVERED' }),
      ],
    })

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls).toHaveLength(2)
  })
})
