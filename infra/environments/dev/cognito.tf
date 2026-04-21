module "cognito" {
  source = "../../modules/cognito"

  project_name = "order_platform"

  env = "dev"
}
