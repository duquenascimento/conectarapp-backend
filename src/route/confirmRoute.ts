import { type FastifyInstance } from 'fastify'
import { AgendamentoGuru, confirmOrder, confirmOrderPremium, handleConfirmPlus, sendConfirmOrderEmail } from '../service/confirmService'
import { type confirmOrderPremiumRequest, type confirmOrderRequest, type agendamentoPedido, type confirmOrderPlusRequest, confirmOrderEmail } from '../types/confirmTypes'
import { sendConfirmOrderEmailSchema } from '../validators/confirmValidator'

export const confirmRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/confirm', async (req, res): Promise<any> => {
    try {
      const result = await confirmOrder(req.body as confirmOrderRequest)
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(201).send({
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
        await res.status(409).send({
          status: 200,
          msg: message
        })
      }
    }
  })

  server.post('/confirm/premium', async (req: any, res): Promise<any> => {
    try {
      await confirmOrderPremium(req.body as confirmOrderPremiumRequest)
      return await res.status(201).send({
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

  server.post('/confirm/agendamento', async (req, res): Promise<any> => {
    try {
      await AgendamentoGuru(req.body as agendamentoPedido)
      return await res.status(201).send({
        status: 200,
        message: 'Agendamento realizado com sucesso!'
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        return await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })

  server.post('/confirm/conectar-plus', async (req, res): Promise<any> => {
    try {
      const body = req.body as confirmOrderPlusRequest
      const result = await handleConfirmPlus(body)
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
      return await res.status(201).send({
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
        await res.status(409).send({
          status: 200,
          msg: message
        })
      }
    }
  })

  server.post('/confirm/send-email-order', async(req, res): Promise<any> => {
    try {
      const { value, error } = sendConfirmOrderEmailSchema.validate(req.body, {
        abortEarly: false
      })

      if(error) {
        return await res.status(400).send({
          status: 400,
          msg: 'Erro de validação ao enviar e-mail de confirmação de pedido.',
          errors: error.details.map((err: { path: any[]; message: any }) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }

      const body: confirmOrderEmail = value

      await sendConfirmOrderEmail(body);

      return await res.status(200).send({
        status: 200,
        msg: `E-mail enviado com sucesso!`
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        return await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })
}
