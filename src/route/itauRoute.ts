import { type FastifyInstance } from 'fastify'

export const itauRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/itau/pix', async (req, res): Promise<any> => {
    try {
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
        await res.status(409).send({
          status: 200,
          msg: message
        })
      }
    }
  })
}
