module "cognito" {
  source       = "../../modules/cognito"
  project_name = var.project_name
  env          = var.env
}
