resource "aws_iam_policy" "terraform_deploy" {
  name = "terraform-deploy-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "cognito-idp:CreateUserPool",
          "cognito-idp:ListUsers",
          "lambda:CreateFunction",
          "apigateway:*",
          "s3:*",
          "dynamodb:*"
        ]
        Resource = "*"
    }]
  })

}
