module "order_events_s3" {
  source        = "../../modules/s3"
  project_name  = var.project_name
  env           = var.env
  bucket_suffix = "order-events"
}
