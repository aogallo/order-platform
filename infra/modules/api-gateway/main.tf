locals {
  route_segments = {
    for k, r in var.routes : k => compact(split("/", trimprefix(r.path, "/")))
  }

  path_keys = distinct(flatten([
    for k, segments in local.route_segments : [
      for i in range(length(segments)) : {
        key        = join("/", slice(segments, 0, i + 1))
        part       = segments[i]
        parent_key = i == 0 ? null : join("/", slice(segments, 0, i))
      }
    ]
  ]))

  path_resources = { for pk in local.path_keys : pk.key => pk }

  route_to_resource = {
    for k, segments in local.route_segments : k => join("/", segments)
  }
}

resource "aws_api_gateway_rest_api" "api" {
  name        = "${var.project_name}-${var.env}"
  description = "${var.project_name} API (${var.env})"
}

resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${var.project_name}-cognito-authorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.api.id
  provider_arns = [var.cognito_user_pool_arn]
}
# --- Path resources (one per unique path segment) ---
resource "aws_api_gateway_resource" "path" {
  for_each = local.path_resources

  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = each.value.parent_key == null ? aws_api_gateway_rest_api.api.root_resource_id : aws_api_gateway_resource.path[each.value.parent_key].id
  path_part   = each.value.part
}

# --- Methods + Integrations (one per route) ---
resource "aws_api_gateway_method" "route" {
  for_each = var.routes

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.path[local.route_to_resource[each.key]].id
  http_method   = upper(each.value.method)
  authorization = each.value.auth_required ? "COGNITO_USER_POOLS" : "NONE"
  authorizer_id = each.value.auth_required ? aws_api_gateway_authorizer.cognito.id : null
}

resource "aws_api_gateway_integration" "route" {
  for_each = var.routes

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.path[local.route_to_resource[each.key]].id
  http_method = aws_api_gateway_method.route[each.key].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = each.value.lambda_invoke_arn
}

# --- CORS (OPTIONS preflight on every resource) ---
resource "aws_api_gateway_method" "options" {
  for_each      = local.path_resources
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.path[each.key].id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options" {
  for_each    = local.path_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.path[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "options" {
  for_each = local.path_resources

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.path[each.key].id
  http_method = aws_api_gateway_method.options[each.key].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options" {
  for_each    = local.path_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.path[each.key].id
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
  dynamic "throttle" {
    for_each = length(keys(var.throttle_settings)) > 0 ? [var.throttle_settings] : []
    content {
      burst_limit = throttle.value.burst_limit
      rate_limit  = throttle.value.rate_limit
    }
  }
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
