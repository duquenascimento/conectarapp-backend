import { type FastifyInstance } from 'fastify'
import { findByExternalId } from '../service/supplierService'
import { HttpException } from '../errors/httpException'

export const supplierRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/supplier/account/:externalId', async (req, res) => {
    const { externalId } = req.params as { externalId: string }
    try {
      const result = await findByExternalId(externalId)

      if (!result) {
        throw new HttpException('Conta de fornecedor não encontrada!', 404)
      }
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
}
