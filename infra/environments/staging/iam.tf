resource "aws_iam_policy" "reporting_lambda" {
  name = "${var.project_name}-reporting-lambda-${var.env}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = module.order_events_sqs.queue_arn
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = module.order_events_dynamodb.table_arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = "${module.order_events_s3.bucket_arn}/*"
      }
    ]
  })
}

