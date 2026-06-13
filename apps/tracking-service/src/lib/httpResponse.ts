export const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

interface JsonResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

export function jsonResponse(statusCode: number, body: unknown): JsonResponse {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  }
}
