variable "aws_region" {
  description = "Região da AWS"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo da instância"
  type        = string
  default     = "t2.micro"
}

variable "instance_name" {
  description = "Nome da instância"
  type        = string
  default     = "api-teste"
}

variable "key_name" {
  description = "Nome da chave SSH no AWS"
  type        = string
  default     = "aws-teste"
}

variable "domain" {
  description = "Domínio completo (subdomínio + domínio)"
  type        = string
  default     = "teste.teste.com.br"
}

variable "email" {
  description = "Email para Let's Encrypt"
  type        = string
  default     = "dukedavi84@gmail.com"
}

variable "api_port" {
  description = "Porta interna da API"
  type        = number
  default     = 3333
}

variable "public_ssh_key" {
  description = "Chave pública do CI/CD (GitHub Actions)"
  type        = string
}

variable "personal_ssh_key" {
  description = "Sua chave pública pessoal (ex: aws-global)"
  type        = string
}