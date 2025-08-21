# Monolito API para App 1.0 - NestJS

Este projeto é uma API desenvolvida com [NestJS](https://nestjs.com/) para realizar integrações com o sistema da Conectar App 1.0, entre elas [Asaas](https://www.asaas.com/). 

---

## Estrutura básica da infraestrutura

```
conectarapp-backend/
├── infra/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf         
│   │   │   ├── terraform.tfvars
│   │   │   └── backend.tf (opcional)
│   │   └── prod/
│   │       ├── main.tf         
│   │       ├── terraform.tfvars
│   │       └── backend.tf (opcional)
│   ├── modules/
│   │   └── ec2-web-server/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│   └── scripts/
│       └── setup.sh
├── .github/
│   └── workflows/
│       └── deploy.yml
├── readme.md
└── src/
     └──.....código fonte
```

---

## Tecnologias Utilizadas

- [**NestJS**](https://nestjs.com/) - Framework Node.js para construção de APIs escaláveis.
- [**TypeScript**](https://www.typescriptlang.org/) - Superset de JavaScript tipado.
- [**Axios**](https://axios-http.com/) - Cliente HTTP para chamadas REST.
- [**Swagger (OpenAPI)**](https://swagger.io/) - Documentação das rotas da API.
- [**Jest**](https://jestjs.io/) - Framework de testes.
- [**class-validator**](https://github.com/typestack/class-validator) - Validação de DTOs.
- [**PostgreSQL**](https://www.postgresql.org/) - Banco de dados relacional (via TypeORM).

---

## Requisitos

- Node.js 18
- NPM ou Yarn
- Banco de dados PostgreSQL

---

## Instalação

1. **Clone o repositório**:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

2. **Instale as dependências**:

```bash
npm install
# ou
yarn install
```

3. **Configure o ambiente**:

Crie o arquivo `.env` na raiz com as seguintes variáveis:

```env
DB_HOST=****.us-east-1****.rds.amazonaws.com
DB_PORT=5432
DB_USER=user
DB_PASS=pass
DB_NAME=banco_utilizado
ASAAS_API_KEY=*******4ZWQtZDY3OGJkNThiZGZh
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

> ⚠️ **IMPORTANTE:** Se a sua variável contiver um símbolo `$`, use `$$` no `.env` para evitar que o Docker interprete como variável do host.

---

## Execução do Projeto

### Com Docker

```bash
docker-compose up --build
```

### Ambiente de Desenvolvimento

```bash
npm run start:dev
```

### Build para Produção

```bash
npm run build
npm run start:prod
```

---

## Testes

### Unitários e de Integração

```bash
npm run test
```

### Cobertura de Testes

```bash
npm run test:cov
```

---

## Documentação da API

A documentação das rotas está disponível no Swagger após iniciar o projeto:

```
http://localhost:3333/docs
```

---

## Autor

**Davi Duque do Nascimento**

---

## Licença

Conéctar

