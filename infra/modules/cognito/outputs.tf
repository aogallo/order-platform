output "user_pool_id" {
  value = aws_cognito_user_pool.this.id
}

output "client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "domain" {
  value = aws_cognito_user_pool_domain.main.id
}

output "user_pool_arn" {
  value       = aws_cognito_user_pool.this.arn
  description = "Cognito ARN"
}
