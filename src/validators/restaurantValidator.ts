import Joi, { type CustomHelpers } from 'joi'
import { validateDocument } from '../utils/validateDocumentsJoi'

const restaurantUpdateSchema = Joi.object({
  id: Joi.string().uuid(),
  externalId: Joi.string().max(10).required(),
  name: Joi.string().max(200).required(),
  legalName: Joi.string().required(),
  active: Joi.boolean(),
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
  registrationReleasedNewApp: Joi.boolean(),
  financeBlock: Joi.boolean(),
  allowClosedSupplier: Joi.boolean(),
  allowMinimumOrder: Joi.boolean(),
  blockedBySuppliers: Joi.array().items(Joi.string()),
  emailBilling: Joi.string().email().required(),
  financeResponsibleName: Joi.string().required().max(255),
  financeResponsiblePhoneNumber: Joi.string().max(15).min(11).required().custom(removeSpecialCharacters, 'Remover caracteres especiais')
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
  externalId: Joi.string().max(10).required(),
  name: Joi.string().max(200),
  legalName: Joi.string(),
  active: Joi.boolean(),
  alternativePhone: Joi.string().max(15).min(11).custom(removeSpecialCharacters, 'Remover caracteres especiais'),
  email: Joi.string().email().allow(''),
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
  registrationReleasedNewApp: Joi.boolean(),
  comercialBlock: Joi.boolean(),
  financeBlock: Joi.boolean(),
  allowClosedSupplier: Joi.boolean(),
  allowMinimumOrder: Joi.boolean(),
  emailBilling: Joi.string().email().required(),
  financeResponsibleName: Joi.string().required().max(255),
  financeResponsiblePhoneNumber: Joi.string().max(15).min(11).required().custom(removeSpecialCharacters, 'Remover caracteres especiais')
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

export function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}

  ;(Object.entries(obj) as Array<[keyof T, T[keyof T]]>).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value
    }
  })

  return result
}

function removeSpecialCharacters(value: string, helpers: CustomHelpers): string | ReturnType<typeof helpers.error> {
  const cleanedValue = value.replace(/[^\w\s]/gi, '')
  return cleanedValue
}

function customDocumentValidation(value: string, helpers: CustomHelpers): string | ReturnType<typeof helpers.error> {
  const isValid = validateDocument(value)
  if (!isValid) {
    return helpers.error('string.invalid', { value: 'Documento inválido' })
  }
  return value
}
