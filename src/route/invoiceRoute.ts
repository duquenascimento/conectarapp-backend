import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply
} from 'fastify'
import { upsert } from '../service/invoiceService'
import { type order_invoice } from '@prisma/client'

type VerifyLinkRequest = FastifyRequest<{
  Querystring: {
    url: string
  }
}>

export const invoiceRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/invoice', async (req, res): Promise<any> => {
    try {
      await upsert(req.body as Pick<order_invoice, 'filePath' | 'orderId' | 'premium'>)
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

  server.get(
    '/verify-link',
    async (req: VerifyLinkRequest, res: FastifyReply): Promise<void> => {
      const { url } = req.query

      if (!url) {
        await res.status(400).send({ response: false, error: 'URL ausente' })
        return
      }

      try {
        const response = await fetch(url, { method: 'HEAD' }) // HEAD para ser mais leve

        await res.status(200).send({
          response: response.ok,
          status: response.status
        })
      } catch (error) {
        console.error('Erro ao verificar URL:', error)
        await res.status(500).send({
          ok: false,
          error: 'Erro ao verificar o link'
        })
      }
    }
  )
}
