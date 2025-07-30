import { type FastifyInstance } from 'fastify'
import { getCombination } from '../service/combinationService'

export const combinationRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/getCombination/:restauranId', async (req, res) => {
    try {
      const { restaurantId } = req.params as { restaurantId: string }

      const result = await getCombination(restaurantId)
      await res.status(200).send({
        status: 200,
        return: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })
}
