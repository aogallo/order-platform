resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.env}-user-pool"

  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-${var.env}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  callback_urls = ["http://localhost:3000/callback"]

  logout_urls = ["http://localhost:3000/logout"]
}

resource "aws_cognito_user_pool_admin" "this" {
  domain       = "${var.project_name}-${var.env}"
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.this.id

}

resource "aws_cognito_user_group" "operator" {
  name         = "operator"
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_group" "viewer" {
  name         = "operator"
  user_pool_id = aws_cognito_user_pool.this.id
}

