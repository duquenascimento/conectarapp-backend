provider "aws" {
  region = var.aws_region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  filter {
    name   = "map-public-ip-on-launch"
    values = ["true"]
  }
}

# ✅ Security Group com nome fixo baseado no projeto, não na instância
resource "aws_security_group" "web" {
   name_prefix = "api-appconectar-sg-"
  description = "Permite SSH, HTTP e HTTPS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "api-appconectar-security-group"
  }

  # ✅ Garante que o novo SG seja criado antes do antigo ser destruído (futuro)
  lifecycle {
    create_before_destroy = true
  }
}

# ✅ Instância com nome variável
resource "aws_instance" "app" {
  ami                    = "ami-085925f297f852dac"  # Ubuntu 22.04 LTS
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.web.id]
  associate_public_ip_address = true

  tags = {
    Name = var.instance_name  # ← Único campo que muda
  }

user_data = <<-EOF
            #!/bin/bash
            export DOMAIN="${var.domain}"
            export API_PORT="${var.api_port}"
            export EMAIL="${var.email}"
            export PUBLIC_SSH_KEY="${var.public_ssh_key}"
            export PERSONAL_SSH_KEY="${var.personal_ssh_key}"
            ${file("${path.module}/scripts/setup.sh")}
            EOF

  lifecycle {
    prevent_destroy = false
  }
}

# Saídas
output "public_ip" {
  value = aws_instance.app.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/aws-global.pem ubuntu@${aws_instance.app.public_ip}"
}

output "app_url_http" {
  value = "http://${var.domain}"
}

output "app_url_https" {
  value = "https://${var.domain}"
}