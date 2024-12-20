import { type FastifyInstance } from 'fastify'
import { listProduct } from '../service/productService'

export const productRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/product/list', async (req, res): Promise<any> => {
    try {
      const result = await listProduct()
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(200).send({
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
