import { type FastifyInstance } from 'fastify'
import { AddClientCount, listRestaurantsByUserId, updateAddressService, updateComercialBlock, updateFinanceBlock } from '../service/restaurantService'

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

  server.post('/rest/updateComercialBlock', async (req, res): Promise<void> => {
    try {
      await updateComercialBlock(req.body as { restId: string, value: boolean })
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

  server.post('/rest/updateFinanceBlock', async (req, res): Promise<void> => {
    try {
      await updateFinanceBlock(req.body as { restId: string, value: boolean })
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

  server.post('/rest/addClientCount', async (req, res): Promise<void> => {
    try {
      await AddClientCount(req.body as { count: number, value: boolean })
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
