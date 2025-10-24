# Regras ESLint - Backend

## Configurações Ativas

### Airbnb Base
- Regras de estilo do Airbnb para JavaScript/TypeScript
- Foca em best practices e código limpo

### Airbnb TypeScript
- Extensão das regras do Airbnb para TypeScript
- Regras específicas de tipagem e sintaxe TS

## Regras Principais

### Formatação
- Indentação: 2 espaços
- Aspas simples para strings
- Ponto e vírgula no final
- Vírgula trailing em objetos/arrays multiline

### TypeScript
- Tipos explícitos onde necessário
- `any` não permitido
- Interfaces preferidas sobre types
- Uso correto de genéricos

### Boas Práticas
- Variáveis não utilizadas são proibidas
- Funções devem ter retorno explícito
- Preferência por `const` sobre `let`
- Nomes descritivos para variáveis/funções

## Comandos Úteis

```bash
# Verificar problemas
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix