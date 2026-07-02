output "order_events_queue_url" {
  value = module.order_events_sqs.queue_url
}

output "order_events_table_name" {
  value = module.order_events_dynamodb.table_name
}

output "order_events_bucket_name" {
  value = module.order_events_s3.bucket_name
}

output "tracking_table_name" {
  value = module.tracking_dynamodb.table_name
}

output "api_gateway_url" {
  description = "Base URL of the API Gateway"
  value       = module.api_gateway.api_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = module.api_gateway.api_id
}
