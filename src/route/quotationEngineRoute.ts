import { type FastifyInstance } from 'fastify'
import { type CotacaoData, newQuotationEngine } from '../service/QuotationEngine'

export const quotationEngineRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/cotacao/calcular', async (req, res) => {
    try {
      return await newQuotationEngine(req.body as CotacaoData)
    } catch (err) {
      console.log('erro', err)
      const message = (err as Error).message
      const status = message === process.env.INTERNAL_ERROR_MSG ? 500 : 400
      return await res.status(status).send({ status, msg: message })
    }
  })
}
