import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { StatusCodes } from 'http-status-codes'
import { APIGatewayProxyEvent } from 'aws-lambda'

vi.mock('../lib/dynamodb', () => ({
  client: new DynamoDBClient({}),
}))

const mockSend = vi.fn()

vi.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(mockSend)

const { handler } = await import('./getTracking')

function makeEvent(orderId?: string): APIGatewayProxyEvent {
  const path = orderId ? `/tracking/${orderId}` : '/tracking'

  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path,
    pathParameters: orderId === undefined ? null : { orderId: orderId },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '/tracking/{orderId}',
    requestContext: {
      accountId: 'test',
      apiId: 'test-api',
      authorizer: {},
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      path,
      stage: 'test',
      resourceId: 'test-resource',
      requestId: 'test-request',
      resourcePath: '/tracking/{orderId}',
      requestTimeEpoch: 0,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'vitest',
        userArn: null,
      },
    },
  }
}

describe('getTracking', () => {
  beforeEach(() => {
    mockSend.mockReset()
  })

  it('returns 200 with entries when tracking exists', async () => {
    mockSend.mockResolvedValue({
      Items: [
        {
          pk: { S: 'tracking-123' },
          sk: { S: '2026-01-01T00:00:00Z' },
          status: { S: 'PENDING' },
          updatedBy: { S: 'order-service' },
        },
        {
          pk: { S: 'tracking-123' },
          sk: { S: '2026-01-02T00:00:00Z' },
          status: { S: 'CONFIRMED' },
          updatedBy: { S: 'order-service' },
        },
      ],
    })

    const result = await handler(makeEvent('order-123'))
    expect(result.statusCode).toBe(StatusCodes.OK)
    const body = JSON.parse(result.body)
    expect(body.entries).toHaveLength(2)
    expect(body.entries[0].status).toBe('PENDING')
    expect(body.entries[1].status).toBe('CONFIRMED')
  })

  it('returns 404 when no tracking data', async () => {
    mockSend.mockResolvedValue({ Items: [] })
    const result = await handler(makeEvent('ord-999'))
    expect(result.statusCode).toBe(404)
  })

  it('returns 400 when orderId is missing', async () => {
    const result = await handler(makeEvent(undefined))
    expect(result.statusCode).toBe(400)
  })
})
