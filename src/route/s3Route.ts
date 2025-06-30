import { type FastifyInstance } from 'fastify'
import { uploadPdf } from '../service/s3Service'
import { type s3PdfRequestData } from '../types/s3FileTypes'
import { HttpException } from '../errors/httpException'

export const s3Route = async (server: FastifyInstance): Promise<void> => {
  server.post('/uploadPdf', async (req, res): Promise<any> => {
    try {
      const s3Url = await uploadPdf(req.body as s3PdfRequestData)
      return await res.status(200).send({
        status: 200,
        s3Url
      })
    } catch (error) {
      const message = (error as Error).message
      const status = error instanceof HttpException ? error.statusCode : 500

      return await res.status(status).send({
        status,
        msg: message
      })
    }
  })
}
