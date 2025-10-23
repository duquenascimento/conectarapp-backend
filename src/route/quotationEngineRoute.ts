import { type FastifyInstance } from 'fastify';
import { newQuotationEngine } from '../service/QuotationEngine';
import { type QuotationEngineRequest } from '../types/quotationEngineTypes';

export const quotationEngineRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/cotacao/calcular', async (req, res) => {
    try {
      return await newQuotationEngine(req.body as QuotationEngineRequest);
    } catch (err) {
      console.log('erro', err);
      const { message } = err as Error;
      const status = message === process.env.INTERNAL_ERROR_MSG ? 500 : 400;
      return res.status(status).send({ status, msg: message });
    }
  });
};
