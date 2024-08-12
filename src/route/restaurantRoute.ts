import { type FastifyInstance } from 'fastify'
import { listRestaurantsByUserId, updateAddressService } from '../service/restaurantService'

export const restaurantRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/restaurant/list', async (req, res): Promise<any> => {
    try {
      const result = await listRestaurantsByUserId(req.body as { token: string })
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/address/update', async (req, res): Promise<void> => {
    try {
      await updateAddressService(req.body as { rest: any })
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })
}
