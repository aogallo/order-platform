import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesAdapter } from './sesAdapter'
import { mockClient } from 'aws-sdk-client-mock'

const sesMock = mockClient(SESClient)

describe('SesAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SES_FROM_ADDRESS = 'test@example.com'
    sesMock.reset()
  })

  it('sends order created email with correct subject and body', async () => {
    const orderId = 'ord-123'
    const total = 99.88
    const sendEmailCommandValue = {
      Message: {
        Subject: { Data: `Order ${orderId} received` },
        Body: {
          Text: {
            Data: `Your order ${orderId} has been received. Total: $${total.toFixed(2)}`,
          },
        },
      },
    }

    sesMock.on(SendEmailCommand).resolves({
      ...sendEmailCommandValue,
    })

    const adapter = new SesAdapter()
    await adapter.sendOrderCreatedEmail(orderId, total)

    const calls = sesMock.commandCalls(SendEmailCommand)

    expect(calls[0].args[0].input).toEqual({
      Destination: {
        ToAddresses: ['test@example.com'],
      },
      Source: 'test@example.com',
      ...sendEmailCommandValue,
    })
  })

  it('sends order updated email with correct status', async () => {
    const adapter = new SesAdapter()
    const orderId = 'ord-893'
    const status = 'SHIPPED'
    const sendEmailCommandValue = {
      Message: {
        Subject: { Data: `Order ${orderId} status update` },
        Body: {
          Text: {
            Data: `Your order ${orderId} status has been updated to: ${status}`,
          },
        },
      },
    }

    sesMock.on(SendEmailCommand).resolves({ ...sendEmailCommandValue })
    await adapter.sendOrderUpdatedEmail(orderId, status)

    const calls = sesMock.commandCalls(SendEmailCommand)

    expect(calls[0].args[0].input).toEqual({
      Destination: {
        ToAddresses: ['test@example.com'],
      },
      Source: 'test@example.com',
      ...sendEmailCommandValue,
    })
  })

  it('falls back to default from address when env var is not set', async () => {
    delete process.env.SES_FROM_ADDRESS
    const adapter = new SesAdapter()
    await adapter.sendOrderCreatedEmail('ord-1', 10)

    const calls = sesMock.commandCalls(SendEmailCommand)
    expect(calls[0].args[0].input.Source).toBe('noreply@example.com')
  })
})
