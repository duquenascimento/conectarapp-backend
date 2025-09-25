import { type FastifyInstance } from 'fastify'
import { checkCartAndAlert } from '../service/alertService'

export const alertsRoutes = async (server: FastifyInstance): Promise<void> => {
  server.post('/alerts/abandoned-cart', async (request, reply) => {
    try {
      const { restaurantId, externalId, name, userId } = request.body as {
        restaurantId: string
        externalId: string
        name: string
        userId: string
      }

      const result = await checkCartAndAlert(restaurantId, externalId, name, userId)

      return await reply.code(200).send({
        success: true,
        message: 'Alerta processado com sucesso',
        data: result
      })
    } catch (err: any) {
      server.log.error(err, 'Erro em /alerts/abandoned-cart')

      return await reply.code(400).send({
        success: false,
        error: err.message || 'Erro inesperado ao processar alerta'
      })
    }
  })
}
