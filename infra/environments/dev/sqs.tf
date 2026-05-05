module "order_events_sqs" {
  source       = "../../modules/sqs"
  project_name = var.project_name
  env          = var.env
  queue_suffix = "order-events"
}
