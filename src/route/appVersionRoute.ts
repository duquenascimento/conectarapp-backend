import { type FastifyInstance } from 'fastify'
import { registerAppVersionService } from '../service/appVersionService'

export const AppVersionRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/appVersion', async (req, res): Promise<any> => {
    try {
      const { externalId, version, statusId, OperationalSystem } = req.body as {
        externalId: string
        version: string
        statusId: number
        OperationalSystem: string
      }

      const result = await registerAppVersionService({ externalId, version, statusId, OperationalSystem })

      return await res.status(200).send({
        status: 200,
        data: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })
}
