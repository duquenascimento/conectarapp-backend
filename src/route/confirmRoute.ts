import { type FastifyInstance } from 'fastify'
import { confirmOrder, confirmOrderPremium, type confirmOrderPremiumRequest, type confirmOrderRequest } from '../service/confirmService'

export const confirmRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/confirm', async (req, res): Promise<any> => {
    try {
      const result = await confirmOrder(req.body as confirmOrderRequest)
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(201).send({
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
        await res.status(409).send({
          status: 200,
          msg: message
        })
      }
    }
  })

  server.post('/confirm/premium', async (req, res): Promise<any> => {
    try {
      await confirmOrderPremium(req.body as confirmOrderPremiumRequest)
      return await res.status(201).send({
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
        await res.status(409).send({
          status: 200,
          msg: message
        })
      }
    }
  })
}
