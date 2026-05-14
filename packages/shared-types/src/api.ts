export interface ApiResponse<T> {
  statusCode: number
  body: T
}

export interface ErrorBody {
  message: string
  error?: string
  requestId?: string
}
