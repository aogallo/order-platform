import { APIGatewayProxyEvent } from 'aws-lambda'
import { jsonResponse } from '../lib/httpResponse'

export const handler = (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id
  const response = jsonResponse(200, { id, status: 'PENDING' })
  return response
}
