import Joi, { type CustomHelpers } from 'joi'
import { validateDocument } from '../utils/validateDocumentsJoi'

const restaurantUpdateSchema = Joi.object({
  id: Joi.string().uuid(),
  externalId: Joi.string().max(10).required(),
  name: Joi.string().max(200).required(),
  legalName: Joi.string().required(),
  active: Joi.boolean(),
  phone: Joi.string().max(15).min(11).custom(removeSpecialCharacters, 'Remover caracteres especiais'),
  alternativePhone: Joi.string().max(15).min(11).custom(removeSpecialCharacters, 'Remover caracteres especiais'),
  email: Joi.string().email(),
  alternativeEmail: Joi.string().email().allow(''),
  user: Joi.array().items(Joi.string().uuid()),
  address: Joi.array().items(Joi.string().uuid()),
  closeDoor: Joi.boolean(),
  favorite: Joi.array().items(Joi.string().uuid()),
  weeklyOrderAmount: Joi.number().min(1).max(7),
  orderValue: Joi.number().precision(2),
  companyRegistrationNumber: Joi.string().custom(customDocumentValidation, 'Validação de CPF ou CNPJ').messages({
    'string.invalid': 'Documento inválido'
  }),
  companyRegistrationNumberForBilling: Joi.string().length(14),
  stateRegistrationNumber: Joi.string().allow('').allow(null),
  cityRegistrationNumber: Joi.string().allow('').allow(null),
  createdAt: Joi.date().allow('').allow(null),
  updatedAt: Joi.date().allow('').allow(null),
  tax: Joi.number().precision(6),
  paymentWay: Joi.string().max(200).allow('').allow(null),
  verduraKg: Joi.boolean(),
  premium: Joi.boolean(),
  comercialBlock: Joi.boolean(),
  financeBlock: Joi.boolean(),
  allowClosedSupplier: Joi.boolean(),
  allowMinimumOrder: Joi.boolean()
}).messages({
  'any.required': 'O campo {#label} é obrigatório',
  'string.empty': 'O campo {#label} não pode estar vazio',
  'string.base': 'O campo {#label} deve ser uma string',
  'string.email': 'O campo {#label} deve ser um e-mail válido',
  'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres',
  'string.min': 'O campo {#label} deve ter no mínimo {#limit} caracteres',
  'number.base': 'O campo {#label} deve ser um número',
  'number.min': 'O campo {#label} deve ser no mínimo {#limit}'
})

export const restaurantPatchSchema = Joi.object({
  // Identificador externo do restaurante (obrigatório)
  externalId: Joi.string()
    .max(10)
    .required(),

  // Nome do restaurante (opcional)
  name: Joi.string()
    .max(200),

  // Razão social (opcional)
  legalName: Joi.string(),

  // Status ativo/inativo (opcional)
  active: Joi.boolean(),

  // Telefone principal (opcional)
  phone: Joi.string()
    .max(15)
    .min(11)
    .custom(removeSpecialCharacters, 'Remover caracteres especiais'),

  // Telefone alternativo (opcional)
  alternativePhone: Joi.string()
    .max(15)
    .min(11)
    .custom(removeSpecialCharacters, 'Remover caracteres especiais'),

  // E-mail principal (opcional)
  email: Joi.string()
    .email()
    .allow(''),

  // E-mail alternativo (opcional)
  alternativeEmail: Joi.string()
    .email()
    .allow(''),

  // Lista de usuários associados ao restaurante (opcional)
  user: Joi.array()
    .items(Joi.string().uuid()),

  // Lista de endereços associados ao restaurante (opcional)
  address: Joi.array()
    .items(Joi.string().uuid()),

  // Fechamento de portas (opcional)
  closeDoor: Joi.boolean(),

  // Lista de favoritos (opcional)
  favorite: Joi.array()
    .items(Joi.string().uuid()),

  // Quantidade semanal de pedidos (opcional)
  weeklyOrderAmount: Joi.number()
    .min(1)
    .max(7),

  // Valor médio do pedido (opcional)
  orderValue: Joi.number()
    .precision(2),

  // CNPJ (opcional)
  companyRegistrationNumber: Joi.string()
    .custom(customDocumentValidation, 'Validação de CPF ou CNPJ')
    .messages({
      'string.invalid': 'Documento inválido'
    }),

  // CNPJ para faturamento (opcional)
  companyRegistrationNumberForBilling: Joi.string()
    .length(14),

  // Inscrição estadual (opcional)
  stateRegistrationNumber: Joi.string()
    .allow('')
    .allow(null),

  // Inscrição municipal (opcional)
  cityRegistrationNumber: Joi.string()
    .allow('')
    .allow(null),

  // Data de criação (opcional)
  createdAt: Joi.date()
    .allow('')
    .allow(null),

  // Data de atualização (opcional)
  updatedAt: Joi.date()
    .allow('')
    .allow(null),

  // Taxa (opcional)
  tax: Joi.number()
    .precision(6),

  // Forma de pagamento (opcional)
  paymentWay: Joi.string()
    .max(200)
    .allow('')
    .allow(null),

  // Verdura por quilo (opcional)
  verduraKg: Joi.boolean(),

  // Status premium (opcional)
  premium: Joi.boolean(),

  // Bloqueio comercial (opcional)
  comercialBlock: Joi.boolean(),

  // Bloqueio financeiro (opcional)
  financeBlock: Joi.boolean(),

  // Permite fornecedor fechado (opcional)
  allowClosedSupplier: Joi.boolean(),

  // Permite pedido mínimo (opcional)
  allowMinimumOrder: Joi.boolean()
}).messages({
  'any.required': 'O campo {#label} é obrigatório',
  'string.empty': 'O campo {#label} não pode estar vazio',
  'string.base': 'O campo {#label} deve ser uma string',
  'string.email': 'O campo {#label} deve ser um e-mail válido',
  'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres',
  'string.min': 'O campo {#label} deve ter no mínimo {#limit} caracteres',
  'number.base': 'O campo {#label} deve ser um número',
  'number.min': 'O campo {#label} deve ser no mínimo {#limit}',
  'number.precision': 'O campo {#label} deve ter no máximo {#limit} casas decimais',
  'array.base': 'O campo {#label} deve ser um array',
  'array.includesRequiredUnknowns': 'O array {#label} contém elementos inválidos'
})

export default restaurantUpdateSchema

function removeSpecialCharacters (value: string, helpers: CustomHelpers): string | ReturnType<typeof helpers.error> {
  const cleanedValue = value.replace(/[^\w\s]/gi, '')
  return cleanedValue
}

function customDocumentValidation (value: string, helpers: CustomHelpers): string | ReturnType<typeof helpers.error> {
  const isValid = validateDocument(value)
  if (!isValid) {
    return helpers.error('string.invalid', { value: 'Documento inválido' })
  }
  return value
}
