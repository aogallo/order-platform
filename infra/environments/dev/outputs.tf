output "order_events_queue_url" {
  value = module.order_events_sqs.queue_url
}

output "order_events_table_name" {
  value = module.order_events_dynamodb.table_name
}

output "order_events_bucket_name" {
  value = module.order_events_s3.bucket_name
}
