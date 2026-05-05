resource "aws_sqs_queue" "order_events_dlq" {
  name                       = "order-events-dlq"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 1209600 # 14 days
}

resource "aws_sqs_queue" "order_events" {
  name                       = "order-events"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600 # 4 days
  receive_wait_time_seconds  = 20

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_events_dlq.arn
    maxReceiveCount     = 3
  })
}

output "order_events_queue_url" {
  value = aws_sqs_queue.order_events.url
}

output "order_events_queue_arn" {
  value = aws_sqs_queue.order_events.arn
}
