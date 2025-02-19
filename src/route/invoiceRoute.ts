import { type FastifyInstance } from 'fastify'
import { upsert } from '../service/invoiceService'
import { type order_invoice } from '@prisma/client'

export const invoiceRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/invoice', async (req, res): Promise<any> => {
    try {
      await upsert(req.body as Pick<order_invoice, 'filePath' | 'orderId'>)
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
