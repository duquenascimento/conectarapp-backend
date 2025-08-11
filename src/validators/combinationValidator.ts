import Joi from 'joi'

const acaoNaFalhaEnum = Joi.string().valid('ignorar', 'indisponivel')
const tipoProdutoEnum = Joi.string().valid('fixar', 'remover')
const tipoFornecedorEnum = Joi.string().valid('qualquer', 'melhor_avaliado', 'especifico')

const produtoPreferenciaSchema = Joi.object({
  produto_sku: Joi.string().min(1).required(),
  classe: Joi.string().min(1).required(),
  fornecedores: Joi.array().items(Joi.string().uuid()).min(1).required(),
  acao_na_falha: acaoNaFalhaEnum.required()
})

const preferenciaProdutoSchema = Joi.object({
  ordem: Joi.number().integer().min(1).required(),
  tipo: tipoProdutoEnum.required(),
  produtos: Joi.array().items(produtoPreferenciaSchema).min(1).required()
})

export const combinacaoSchema = Joi.object({
  restaurant_id: Joi.string().required(),
  nome: Joi.string().min(1).required(),
  bloquear_fornecedores: Joi.boolean().default(false),
  dividir_em_maximo: Joi.number().integer().min(1).required(),
  preferencia_fornecedor_tipo: tipoFornecedorEnum.default('qualquer'),
  fornecedores_bloqueados: Joi.array().items(Joi.string().uuid()).default([]),
  fornecedores_especificos: Joi.array().items(Joi.string().uuid()).default([]),
  definir_preferencia_produto: Joi.boolean().required(),
  preferencias: Joi.array().items(preferenciaProdutoSchema).default([]),
  preferencias_hard: Joi.boolean().default(false)
})
