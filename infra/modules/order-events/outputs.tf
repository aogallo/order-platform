output "queue_url" {
  value = aws_sqs_queue.order_events.url
}

output "queue_arn" {
  value = aws_sqs_queue.order_events.arn
}

output "dlq_arn" {
  value = aws_sqs_queue.order_events_dlq.arn
}

output "table_name" {
  value = aws_dynamodb_table.order_events.name
}

output "bucket_name" {
  value = aws_s3_bucket.order_events.bucket
}

output "reporting_lambda_policy_arn" {
  value = aws_iam_policy.reporting_lambda.arn
}
