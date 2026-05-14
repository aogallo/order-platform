module "order_events_dynamodb" {
  source       = "../../modules/dynamodb"
  project_name = var.project_name
  env          = var.env
  table_suffix = "order-events"
}

module "tracking_dynamodb" {
  source       = "../../modules/dynamodb"
  project_name = var.project_name
  env          = var.env
  table_suffix = "tracking"
}

