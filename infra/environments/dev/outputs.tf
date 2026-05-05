output "order_events_queue_url" {
  value = module.order_events.queue_url
}

output "order_events_table_name" {
  value = module.order_events.table_name
}

output "order_events_bucket_name" {
  value = module.order_events.bucket_name
}
