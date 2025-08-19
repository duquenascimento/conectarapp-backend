import Joi from 'joi'

// Produto dentro de fornecedores
const produtoSchema = Joi.object({
  valorPorUnid: Joi.number().required(),
  sku: Joi.string().required(),
  quantidade: Joi.number().required(),
  classe: Joi.string().required()
})

// Produto dentro da cesta
const produtoCestaSchema = Joi.object({
  sku: Joi.string().required(),
  quantidade: Joi.number().required(),
  classe: Joi.string().required()
})

// Fornecedor com produtos e descontos
const fornecedorSchema = Joi.object({
  id: Joi.string().required(),
  produtos: Joi.array().items(produtoSchema).required(),
  descontos: Joi.object().pattern(Joi.string(), Joi.number()).required(), // { valorPedido: desconto }
  pedidoMinimo: Joi.number().required()
})

// Preferência por produto
const preferenciaProdutoSchema = Joi.object({
  sku: Joi.string().required(),
  fornecedor: Joi.string().required()
})

// Preferência por classe
const preferenciaClasseSchema = Joi.object({
  classe: Joi.string().required(),
  fornecedores: Joi.array().items(Joi.string()).required()
})

// Esquema principal da requisição
export const requisicaoSchema = Joi.object({
  fornecedores: Joi.array().items(fornecedorSchema).required(),
  fornecedoresBloqueados: Joi.array().items(Joi.string()).optional(),
  preferenciasProduto: Joi.array().items(preferenciaProdutoSchema).optional(),
  preferenciasClasse: Joi.array().items(preferenciaClasseSchema).optional(),
  preferenciasHard: Joi.boolean().optional(),
  cesta: Joi.array().items(produtoCestaSchema).required(),
  taxa: Joi.number().optional()
})
