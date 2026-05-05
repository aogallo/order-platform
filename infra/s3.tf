resource "aws_s3_bucket" "order_events" {
  bucket = "order-events-dev"
}

resource "aws_s3_bucket_versioning" "order_events" {
  bucket = aws_s3_bucket.order_events.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "order_events" {
  bucket = aws_s3_bucket.order_events.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "order_events" {
  bucket = aws_s3_bucket.order_events.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
