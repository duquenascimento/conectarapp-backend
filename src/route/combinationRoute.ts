import { type FastifyInstance } from 'fastify'
import { deleteCombination, getCombination, postCombination, putCombination } from '../service/combinationService'
import { combinacaoSchema } from '../validators/combinationValidator'
import { type CombinacaoInput } from '../types/combinationType'

export const combinationRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/combination/:restaurantId', async (req, res) => {
    try {
      const { restaurantId } = req.params as { restaurantId: string }

      const result = await getCombination(restaurantId)
      await res.status(200).send({
        status: 200,
        return: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })

  server.post('/combination', async (req, res) => {
    try {
      const { value, error } = combinacaoSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      })

      if (error) {
        return await res.status(400).send({ status: 400, msg: error.details.map((d) => d.message).join(', ') })
      }

      const body: CombinacaoInput = value

      await postCombination(body)
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })

  server.put('/combination/:id/update', async (req, res) => {
    try {
      const { id } = req.params as { id: string }
      const { value, error } = combinacaoSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      })

      if (error) {
        return await res.status(400).send({ status: 400, msg: error.details.map((d) => d.message).join(', ') })
      }

      const body: CombinacaoInput = value

      await putCombination(id, body)
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })

  server.delete('/combination/:id/delete', async (req, res) => {
    try {
      const { id } = req.params as { id: string }
      const result = await deleteCombination(id)
      return await res.status(result.status).send(result.data)
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({ status: 500, msg: message })
      }
      return await res.status(400).send({ status: 400, msg: message })
    }
  })
}
