import { type FastifyInstance } from 'fastify'
import { suppliersPrices } from '../service/priceService'
import { type ICartList } from '../service/cartService'

export const priceRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/price/list', async (req, res): Promise<any> => {
    try {
      const result = await suppliersPrices(req.body as ICartList)
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(201).send({
        status: 200,
        data: result.data
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
          status: 409,
          msg: message
        })
      }
    }
  })
}
