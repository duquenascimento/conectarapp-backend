import { type FastifyError, type FastifyRequest, type FastifyReply } from 'fastify'
import httpStatus from 'http-status'

export function errorHandler (error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  console.error(error)

  const status = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
  const message = error.message || 'Erro interno do servidor'

  void reply.status(status).send({
    success: false,
    statusCode: status,
    error: {
      name: error.name || 'InternalServerError',
      message,
      ...(error.validation && { details: error.validation }) // Exemplo comum: validação Zod ou AJV
    }
  })
}
