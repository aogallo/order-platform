import { APIGatewayEvent, Context } from 'aws-lambda'

export const handler = async (event: APIGatewayEvent, context: Context) => {
  try {
    const orderCollection = process.env.ORDER_COLLECTION
  } catch (error) {
    console.error(
      `Failed to process order: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    throw error
  }
}
