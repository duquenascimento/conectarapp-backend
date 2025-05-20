import { type FastifyInstance } from 'fastify'
import { createCumulativeReport } from '../service/cumulativeReportService'
import { type ReportData } from '../types/cummulativeTypes'

export const cumulativeReportRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/reports/cumulative', async (req, res): Promise<any> => {
    try {
      const finalUrl = await createCumulativeReport(req.body as ReportData)
      return await res.status(200).send({
        status: 200,
        msg: 'Relatório salvo com sucesso no S3.',
        url: finalUrl
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
