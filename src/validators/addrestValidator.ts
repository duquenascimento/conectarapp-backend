import Joi from 'joi'

const addressUpdateSchema = Joi.object({
  externalId: Joi.string().max(10).required(),
  id: Joi.string().uuid(),
  restaurant: Joi.array().items(Joi.string().uuid()),
  active: Joi.boolean(),
  address: Joi.string().max(200),
  neighborhood: Joi.string().max(200),
  initialDeliveryTime: Joi.date().iso().allow('').allow(null),
  finalDeliveryTime: Joi.date().iso().allow('').allow(null),
  deliveryInformation: Joi.string().max(500),
  closedDoorDelivery: Joi.boolean(),
  responsibleReceivingName: Joi.string().max(200).allow(''),
  responsibleReceivingPhoneNumber: Joi.string().max(15).allow(''),
  zipCode: Joi.string().min(8).max(10).allow(''),
  deliveryReference: Joi.string().max(500).allow('').allow(null),
  createdAt: Joi.date().allow('').allow(null),
  updatedAt: Joi.date().allow('').allow(null),
  localType: Joi.string().max(200).allow('').allow(null),
  localNumber: Joi.string().max(25).allow('').allow(null),
  city: Joi.string().max(200).allow('').allow(null),
  complement: Joi.string().max(200).allow('').allow(null)
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

export default addressUpdateSchema
