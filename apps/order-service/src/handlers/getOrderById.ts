import { APIGatewayProxyEvent } from 'aws-lambda'

export const handler = (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id
  return {
    statusCode: 200,
    body: JSON.stringify({
      id,
      status: 'PENDING',
    }),
  }
}
