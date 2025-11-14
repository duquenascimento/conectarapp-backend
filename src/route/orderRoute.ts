import { type FastifyInstance } from 'fastify'
import { cancelOrder, findOrder, filterOrdersService } from '../service/orderService'
import orderFilterSchema from '../validators/orderValidator'

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

  server.get('/orders/filter', async (req, res) => {
    try {
      const { error, value } = orderFilterSchema.validate(req.query, {
        abortEarly: false
      })

      if (error) {
        return await res.status(400).send({
          status: 400,
          msg: 'Erro de validação',
          errors: error.details.map((err: { path: any[]; message: any }) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      const { page, limit, ...filters } = value

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const result = await filterOrdersService(filters, page, limit)
      return await res.status(200).send(result)
    } catch (err) {
      await res.status(500).send({
        status: 500,
        msg: process.env.INTERNAL_ERROR_MSG
      })
    }
  })
}
