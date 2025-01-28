import { type FastifyInstance } from 'fastify'
import { cancelOrder, findOrder } from '../service/orderService'

export const orderRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/orders/:id', async (req, res): Promise<any> => {
    try {
      const { id } = req.params as { id: string | undefined }
      const result = await findOrder(id)
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(200).send({
        status: 200,
        data: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.put('/orders/:id/cancel', async (req, res): Promise<any> => {
    try {
      const { id } = req.params as { id: string | undefined }
      await cancelOrder(id)
      return await res.status(200).send({
        status: 200
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })
}
