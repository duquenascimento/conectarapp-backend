import Joi from "joi";

export const sendConfirmOrderEmailSchema = Joi.object({
    nomeUsuario: Joi.string().trim().min(1).required(),
    emailUsuario: Joi.string().email().required(),
    numeroPedido: Joi.string().trim().min(1).required(),
    valorPedido: Joi.number().positive().required(),
    nomeFornecedor: Joi.string().trim().min(4).required(),
    dataPedido: Joi.string().isoDate().prefs({convert: false}).max(10).required(),
    horarioEntrega: Joi.string().required(),
    reciboUrl: Joi.string().uri(),
    boletoUrl: Joi.string().uri()
}).messages({
    'any.required': 'O campo {#label} é obrigatório.',
    'string.base': 'O campo {#label} deve ser uma string.',
    'string.min': 'O campo {#label} deve ter no mínimo {#limit} caracteres.',
    'string.max': 'O campo {#label} deve ter no máximo {#limit} caracteres.',
    'string.email': 'O campo {#label} deve ser um e-mail válido.',
    'string.isoDate': 'O campo {#label} deve ser uma data válida.',
    'string.uri': 'O campo {#label} deve ser uma URL válida.',
    'string.empty': 'O campo {#label} não pode ser vazio.',
    'number.base': 'O campo {#label} deve ser um número.',
    'number.positive': 'O campo {#label} deve ser um número positivo.'
})