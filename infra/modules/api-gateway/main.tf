locals {
  route_resource_ids = {
    create-order = aws_api_gateway_resource.orders.id
    list-orders = aws_api_gateway_resource.orders.id

    get-order    = aws_api_gateway_resource.order_id.id

    get-tracking = aws_api_gateway_resource.tracking_order_id.id
  }

  cors_resource_ids = {
    orders            = aws_api_gateway_resource.orders.id
    order_id          = aws_api_gateway_resource.order_id.id
    tracking          = aws_api_gateway_resource.tracking.id
    tracking_order_id = aws_api_gateway_resource.tracking_order_id.id
  }
}

resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-${var.env}"
  description = "${var.project_name} API (${var.env})"
}

resource "aws_api_gateway_authorizer" "cognito" {
  count         = var.cognito_user_pool_arn == null ? 0 : 1
  name          = "${var.project_name}-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  provider_arns = [var.cognito_user_pool_arn]
}
# --- Path resources ---
resource "aws_api_gateway_resource" "orders" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "orders"
}

resource "aws_api_gateway_resource" "order_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.orders.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "tracking" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "tracking"
}

resource "aws_api_gateway_resource" "tracking_order_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.tracking.id
  path_part   = "{orderId}"
}


# --- Methods + Integrations (one per route) ---
resource "aws_api_gateway_method" "route" {
  for_each = var.routes

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = local.route_resource_ids[each.key]
  http_method   = upper(each.value.method)
  authorization = each.value.auth_required ? "COGNITO_USER_POOLS" : "NONE"
  authorizer_id = each.value.auth_required ? aws_api_gateway_authorizer.cognito[0].id : null
}

resource "aws_api_gateway_integration" "route" {
  for_each = var.routes

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = local.route_resource_ids[each.key]
  http_method = aws_api_gateway_method.route[each.key].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = each.value.lambda_invoke_arn
}

# --- CORS (OPTIONS preflight on every resource) ---
resource "aws_api_gateway_method" "options" {
  for_each      = local.cors_resource_ids
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = each.value
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each    = local.cors_resource_ids
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each = local.cors_resource_ids

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each    = local.cors_resource_ids
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = aws_api_gateway_method_response.options[each.key].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,PATCH,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"

  }
  depends_on = [aws_api_gateway_method_response.options]
}

# --- Deployment + Stage ---

resource "aws_api_gateway_deployment" "deploy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_rest_api.api.body,
      aws_api_gateway_integration.route,
      aws_api_gateway_integration.options,
    ]))
  }
  lifecycle {
    create_before_destroy = true
  }
  depends_on = [
    aws_api_gateway_integration.route,
    aws_api_gateway_integration.options,
    aws_api_gateway_integration_response.options,
  ]
}
resource "aws_api_gateway_stage" "stage" {
  stage_name    = var.env
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deploy.id
  tags = {
    Environment = var.env
    Project     = var.project_name
  }
}

# --- Lambda permissions (allow API Gateway to invoke each Lambda) ---
resource "aws_lambda_permission" "route" {
  for_each      = var.routes
  statement_id  = "AllowAPIGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = each.value.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/${upper(each.value.method)}/${trimprefix(each.value.path, "/")}"
}
