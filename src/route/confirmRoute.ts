import { type FastifyInstance } from 'fastify';
import {
  AgendamentoGuru,
  confirmOrder,
  confirmOrderPremium,
  handleConfirmPlus,
} from '../service/confirmService';
import {
  type confirmOrderPremiumRequest,
  type confirmOrderRequest,
  type agendamentoPedido,
  type confirmOrderPlusRequest,
} from '../types/confirmTypes';

export const confirmRoute = async (server: FastifyInstance): Promise<void> => {
  // TODO: CHECK HERE
  server.post('/confirm', async (req, res): Promise<any> => {
    try {
      const result = await confirmOrder(req.body as confirmOrderRequest);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(201).send({
        status: 200,
        data: result,
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
      }
    }
  });

  server.post('/confirm/premium', async (req: any, res): Promise<any> => {
    try {
      await confirmOrderPremium(req.body as confirmOrderPremiumRequest);
      return await res.status(201).send({
        status: 200,
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
      }
    }
  });

  server.post('/confirm/agendamento', async (req, res): Promise<any> => {
    try {
      await AgendamentoGuru(req.body as agendamentoPedido);
      return await res.status(201).send({
        status: 200,
        message: 'Agendamento realizado com sucesso!',
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return res.status(500).send({
          status: 500,
          msg: message,
        });
      }
      return res.status(400).send({
        status: 400,
        msg: message,
      });
    }
  });

  // TODO: CHECK HERE
  server.post('/confirm/conectar-plus', async (req, res): Promise<any> => {
    try {
      const body = req.body as confirmOrderPlusRequest;
      const result = await handleConfirmPlus(body);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(201).send({
        status: 200,
        data: result,
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
      }
    }
  });
};
