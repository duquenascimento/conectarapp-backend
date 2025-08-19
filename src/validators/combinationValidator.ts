import Joi from 'joi'

const acaoNaFalhaEnum = Joi.string().valid('ignorar', 'indisponivel')
const tipoProdutoEnum = Joi.string().valid('fixar', 'remover')
const tipoFornecedorEnum = Joi.string().valid('qualquer', 'melhor_avaliado', 'especifico')

const produtoPreferenciaSchema = Joi.object({
  produto_sku: Joi.string().min(1).optional(),
  classe: Joi.string().min(1).optional(),
  fornecedores: Joi.array().items(Joi.string()).min(1).required(),
  acao_na_falha: acaoNaFalhaEnum.required()
}).custom((value, helpers) => {
  const hasSku = !!value.produto_sku
  const hasClasse = !!value.classe

  if (!hasSku && !hasClasse) {
    return helpers.error('any.custom', { message: 'Pelo menos um dos campos produto_sku ou classe deve ser preenchido' })
  }
  if (hasSku && hasClasse) {
    return helpers.error('any.custom', { message: 'Somente um dos campos produto_sku ou classe deve ser preenchido' })
  }
  return value
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
  dividir_em_maximo: Joi.number().integer().min(2).required(),
  preferencia_fornecedor_tipo: tipoFornecedorEnum.default('qualquer'),
  fornecedores_bloqueados: Joi.array().items(Joi.string()).default([]),
  fornecedores_especificos: Joi.array().items(Joi.string()).default([]),
  definir_preferencia_produto: Joi.boolean().required(),
  preferencias: Joi.array().items(preferenciaProdutoSchema).default([]),
  preferencias_hard: Joi.boolean().default(false)
})