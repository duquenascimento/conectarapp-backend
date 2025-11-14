import Joi from 'joi'

export const cumulativeReportSchema = Joi.object({
  url: Joi.string().uri().required(),
  fileName: Joi.string()
    .trim()
    .regex(/^[\w\\-]+$/)
    .max(255)
    .required()
})
