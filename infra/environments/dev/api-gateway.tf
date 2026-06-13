data "aws_caller_identity" "current" {}

data "aws_lambda_function" "create_order" {
  function_name = "order-service-${var.env}-createOrder"
}

data "aws_lambda_function" "get_order" {
  function_name = "order-service-${var.env}-getOrderById"
}

data "aws_lambda_function" "get_tracking" {
  function_name = "tracking-service-${var.env}-getTracking"
}

module "api_gateway" {
  source       = "../../modules/api-gateway"
  project_name = var.project_name
  env          = var.env

  cognito_user_pool_arn = module.cognito.user_pool_arn

  routes = {
    create-order = {
      path                 = "/orders"
      method               = "POST"
      lambda_function_name = data.aws_lambda_function.create_order.function_name
      lambda_invoke_arn    = data.aws_lambda_function.create_order.arn
      auth_required        = true
    }
    get-order = {
      path                 = "/orders/{id}"
      method               = "GET"
      lambda_function_name = data.aws_lambda_function.get_order.function_name
      lambda_invoke_arn    = data.aws_lambda_function.get_order.arn
      auth_required        = true
    }
    get-tracking = {
      path                 = "/tracking/{orderId}"
      method               = "GET"
      lambda_function_name = data.aws_lambda_function.get_tracking.function_name
      lambda_invoke_arn    = data.aws_lambda_function.get_tracking.arn
      auth_required        = true
    }
  }
}
