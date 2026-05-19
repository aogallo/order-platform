import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { OrderStatus } from '@order-platform/shared-types'

export class SesAdapter {
  constructor(private readonly client: SESClient = new SESClient({})) {}

  private get fromAddress(): string {
    return process.env.SES_FROM_ADDRESS ?? 'noreply@example.com'
  }

  async sendOrderCreatedEmail(orderId: string, total: number): Promise<void> {
    const sendEmailCommand = new SendEmailCommand({
      Source: this.fromAddress,
      Destination: { ToAddresses: [this.fromAddress] },
      Message: {
        Subject: { Data: `Order ${orderId} received` },
        Body: {
          Text: {
            Data: `Your order ${orderId} has been received. Total: $${total.toFixed(2)}`,
          },
        },
      },
    })

    await this.client.send(sendEmailCommand)
  }

  async sendOrderUpdatedEmail(orderId: string, status: OrderStatus): Promise<void> {
    const sendEmailCommand = new SendEmailCommand({
      Source: this.fromAddress,
      Destination: { ToAddresses: [this.fromAddress] },
      Message: {
        Subject: { Data: `Order ${orderId} status update` },
        Body: {
          Text: {
            Data: `Your order ${orderId} status has been updated to: ${status}`,
          },
        },
      },
    })

    await this.client.send(sendEmailCommand)
  }
}
