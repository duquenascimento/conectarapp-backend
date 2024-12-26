import Joi, { type CustomHelpers } from 'joi'
import { validateDocument } from '../utils/validateDocumentsJoi'

const registerSchema = Joi.object({
  token: Joi.string().required(),
  cnpj: Joi.string().custom(customDocumentValidation, 'Validação de CPF ou CNPJ').required().messages({
    'string.invalid': 'Documento inválido'
  }),
  alternativeEmail: Joi.string().email().required(),
  email: Joi.string().email().required(),
  alternativePhone: Joi.string().max(15).min(11).allow('').custom(removeSpecialCharacters, 'Remover caracteres especiais'),
  phone: Joi.string().max(15).min(11).required().custom(removeSpecialCharacters, 'Remover caracteres especiais'),
  complement: Joi.string().optional().allow(''),
  localNumber: Joi.string().required(),
  street: Joi.string().required().max(255),
  neigh: Joi.string().required().max(255),
  zipcode: Joi.string().max(8).min(8).required(),
  restaurantName: Joi.string().required(),
  legalRestaurantName: Joi.string().required(),
  cityNumberId: Joi.string().required().allow(''),
  stateNumberId: Joi.string().optional().allow(''),
  paymentWay: Joi.string().required(),
  orderValue: Joi.number().min(1).required(),
  weeklyOrderAmount: Joi.string().pattern(/^\d+$/).required().custom(validateNumeroString, 'Validação de número entre 1 e 7').messages({
    'any.custom': '{{#message}}'
  }),
  deliveryObs: Joi.string().optional().allow(''),
  closeDoor: Joi.boolean().required(),
  maxHour: Joi.string().required(),
  minHour: Joi.string().required(),
  localType: Joi.string().required(),
  city: Joi.string().required(),
  inviteCode: Joi.string().optional().allow('')
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

export default registerSchema

function validateNumeroString (value: string, helpers: CustomHelpers): number | ReturnType<typeof helpers.error> {
  const numero = parseInt(value, 10)
  if (numero < 1 || numero > 7) {
    return helpers.error('any.custom', { message: 'O número máximo permitido é 7' })
  }
  return numero
}

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
