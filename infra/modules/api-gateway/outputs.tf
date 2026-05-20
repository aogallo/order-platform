output "api_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.api.id
}

output "api_url" {
  description = "Base URL of the API Gateway stage"
  value       = "${aws_api_gateway_deployment.deploy.invoke_url}/${aws_api_gateway_stage.stage.stage_name}"
}

output "execution_arn" {

  description = "Execution ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.api.execution_arn
}
