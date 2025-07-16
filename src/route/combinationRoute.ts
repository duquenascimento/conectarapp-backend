import { type FastifyInstance } from 'fastify'
import { getCombination, postCombination } from '../service/combinationService'
import { combinacaoSchema } from '../validators/combinationValidator'
import { type CombinacaoInput } from '../types/combinationType'

export const combinationRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/getCombination/:restaurant_id', async (req, res) => {
    try {
      const { restaurant_id } = req.params as { restaurant_id: string }

      const result = await getCombination(restaurant_id)
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

  server.post('/setCombination', async (req, res) => {
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
}
