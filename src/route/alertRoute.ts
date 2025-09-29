import { type FastifyInstance } from 'fastify'
import { checkCartAndAlert } from '../service/alertService'

export const alertsRoutes = async (server: FastifyInstance): Promise<void> => {
  server.post('/alerts/abandoned-cart', async (request, reply) => {
    try {
      const { restaurantId, externalId, restaurantName, userId } = request.body as {
        restaurantId: string
        externalId: string
        restaurantName: string
        userId: string
      }

      if (!restaurantId || !userId) {
        return await reply.code(400).send({ error: 'restaurantId e userId são obrigatórios' })
      }

      const result = await checkCartAndAlert(restaurantId, externalId, restaurantName, userId)
      return await reply.code(200).send({
        success: true,
        message: 'Alerta processado com sucesso',
        data: result
      })
    } catch (err: any) {
      console.error('Erro na rota /alerts/abandoned-cart:', err)
      return await reply.code(500).send({ error: err.message })
    }
  })
}
