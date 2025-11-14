import Joi from 'joi'

const orderFilterSchema = Joi.object({
  // Campos de paginação
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'O campo {#label} deve ser um número',
    'number.min': 'O campo {#label} deve ser no mínimo {#limit}'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'O campo {#label} deve ser um número',
    'number.min': 'O campo {#label} deve ser no mínimo {#limit}',
    'number.max': 'O campo {#label} deve ser no máximo {#limit}'
  }),

  // Campos de filtro dinâmicos
  id: Joi.string().max(50).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  restaurantId: Joi.string().max(50).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  addressId: Joi.string().max(50).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  orderDate: Joi.date().iso().messages({
    'date.base': 'O campo {#label} deve ser uma data válida',
    'date.format': 'O campo {#label} deve estar no formato ISO'
  }),
  deliveryDate: Joi.date().iso().messages({
    'date.base': 'O campo {#label} deve ser uma data válida',
    'date.format': 'O campo {#label} deve estar no formato ISO'
  }),
  orderHour: Joi.date().iso().messages({
    'date.base': 'O campo {#label} deve ser uma data válida',
    'date.format': 'O campo {#label} deve estar no formato ISO'
  }),
  paymentWay: Joi.string().max(100).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  referencePoint: Joi.string().max(200).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  initialDeliveryTime: Joi.date().iso().messages({
    'date.base': 'O campo {#label} deve ser uma data válida',
    'date.format': 'O campo {#label} deve estar no formato ISO'
  }),
  finalDeliveryTime: Joi.date().iso().messages({
    'date.base': 'O campo {#label} deve ser uma data válida',
    'date.format': 'O campo {#label} deve estar no formato ISO'
  }),
  totalSupplier: Joi.number().messages({
    'number.base': 'O campo {#label} deve ser um número'
  }),
  totalConectar: Joi.number().messages({
    'number.base': 'O campo {#label} deve ser um número'
  }),
  status: Joi.string().max(50).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  detailing: Joi.array().items(Joi.string()).messages({
    'array.base': 'O campo {#label} deve ser um array',
    'string.base': 'Cada item do campo {#label} deve ser uma string'
  }),
  tax: Joi.number().messages({
    'number.base': 'O campo {#label} deve ser um número'
  }),
  supplierId: Joi.string().max(50).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  }),
  calcOrderAgain: Joi.any(), // Permite qualquer tipo
  orderDocument: Joi.string().max(100).messages({
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres'
  })
})

// .unknown(true) // Permite campos adicionais não definidos no esquema

export default orderFilterSchema
