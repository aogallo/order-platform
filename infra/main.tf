provider "aws" {
  region     = "us-east-1"
  access_key = "test"
  secret_key = "test"

  skip_credentials_validation = true
  skip_requesting_account_id  = true

  endpoints {
    s3         = "http://localhost:4566"
    lambda     = "http://localhost:4566"
    apigateway = "http://localhost:4566"
    dynamodb   = "http://localhost:4566"
    sqs        = "http://localhost:4566"
    ses        = "http://localhost:4566"
    sesv2      = "http://localhost:4566"
    cognitoidp = "http://localhost:4566"
  }
}
