variable "project_name" {
  type        = string
  description = "Project name used for resource naming"
}

variable "env" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "cognito_user_pool_arn" {
  type        = string
  default     = null
  nullable    = true
  description = "ARN of the Cognito User Pool for the COGNITO_USER_POOLS authorizer"
}

variable "routes" {
  type = map(object({
    path                 = string
    method               = string
    lambda_function_name = string
    lambda_invoke_arn    = string
    auth_required        = bool
  }))
  description = "Map of API routes. Key is a unique identifier (e.g. 'create-order')."
}

variable "cors_allowed_origins" {
  type        = list(string)
  default     = ["*"]
  description = "Allowed origins for CORS"
}

