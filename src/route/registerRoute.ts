import { type FastifyInstance } from 'fastify'
import { type CheckCnpj, checkCnpj, fullRegister, type RestaurantFormData } from '../service/registerService'

export const registerRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/register/checkCnpj', async (req, res): Promise<any> => {
    try {
      const result = await checkCnpj(req.body as CheckCnpj)
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

  server.post('/register/full-register', async (req, res): Promise<any> => {
    try {
      await fullRegister(req.body as RestaurantFormData & { token: string })
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
