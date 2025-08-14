provider "aws" {
  region = var.aws_region
}

module "app" {
  source = "../../modules/ec2-web-server"

  aws_region         = var.aws_region
  instance_type      = var.instance_type
  instance_name      = var.instance_name
  key_name           = var.key_name
  domain             = var.domain
  email              = var.email
  public_ssh_key     = var.public_ssh_key
  personal_ssh_key   = var.personal_ssh_key
}