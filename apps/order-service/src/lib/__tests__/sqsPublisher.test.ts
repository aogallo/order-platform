import { publishOrderCreated } from '../sqsPublisher'

// mock SQS
const mockSend = vi.hoisted(() => vi.fn())

vi.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: vi.fn(function () {
    return { send: mockSend }
  }),
  SendMessageCommand: vi.fn(),
}))

describe('publishOrderCreated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.SQS_QUEUE_URL
  })

  it('publishes message when SQS_QUEUE_URL is set', async () => {
    process.env.SQS_QUEUE_URL = 'http://localhost:4566/000000000000/order-events'
    mockSend.mockResolvedValue({ MessageId: 'msg-123' })

    await publishOrderCreated({ orderId: 'order-1', total: 99.99 })

    expect(mockSend).toHaveBeenCalledTimes(1)
  })

  it('skips publish when SQS_QUEUE_URL is not set', async () => {
    await publishOrderCreated({ orderId: 'order-2', total: 21.21 })

    expect(mockSend).not.toHaveBeenCalled()
  })

  it('does not throw when SQS send fails', async () => {
    process.env.SQS_QUEUE_URL = 'http://localhost:4566/000000000000/order-events'
    mockSend.mockRejectedValue(new Error('Network error'))

    await expect(publishOrderCreated({ orderId: 'order-1', total: 99.99 })).resolves.not.toThrow()
  })
})
