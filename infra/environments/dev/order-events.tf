module "order_events" {
  source       = "../../modules/order-events"
  project_name = var.project_name
  env          = var.env
}
