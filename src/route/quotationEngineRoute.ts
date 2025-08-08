import { type FastifyInstance } from 'fastify'
import { type CotacaoData, newQuotationEngine, quotationEngine } from '../service/QuotationEngine'
import { type ICartList } from '../service/cartService'

export const quotationEngineRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/getQuotation', async (req, res) => {
    try {
      return await quotationEngine(req.body as ICartList)
    } catch (err) {
      console.log('erro', err)
      const message = (err as Error).message
      const status = message === process.env.INTERNAL_ERROR_MSG ? 500 : 400
      return await res.status(status).send({ status, msg: message })
    }
  })

  server.post('/calcQuotation', async (req, res) => {
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
