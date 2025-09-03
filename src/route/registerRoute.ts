import { type FastifyInstance } from 'fastify'
import { findById } from '../repository/userRepository'
import { type CheckCnpj, checkCnpj, fullRegister, getProgress, type RestaurantFormData, saveProgress } from '../service/registerService'
import registerSchema from '../validators/registerValidator'

export const registerRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/register/checkCnpj', async (req, res): Promise<any> => {
    try {
      const result = await checkCnpj(req.body as CheckCnpj)
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/register/full-register', async (req, res): Promise<any> => {
    const { error } = registerSchema.validate(req.body)
    if (error) {
      return await res.status(422).send({ error: error.details[0].message })
    }

    try {
      await fullRegister(req.body as RestaurantFormData & { token: string })
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/register/save-progress', async (req, res): Promise<any> => {
    try {
      const token = (req.headers.authorization ?? '').replace('Bearer ', '')
      const { step, values } = req.body as { step: number, values: Record<string, any> }

      await saveProgress(token, step, values)
      return await res.status(200).send({ status: 200, msg: 'Progresso salvo' })
    } catch (err) {
      const message = (err as Error).message
      return await res.status(500).send({ status: 500, msg: message })
    }
  })

  server.get('/register/progress', async (req, res) => {
    try {
      const token = (req.headers.authorization ?? '').replace('Bearer ', '')
      const progressResult = await getProgress(token)

      if (!progressResult.success) {
        if (progressResult.error === 'Nenhum progresso encontrado') {
          return await res.status(204).send()
        }

        return await res.status(400).send({
          status: 400,
          msg: progressResult.error
        })
      }

      const progress = progressResult.data!
      const hasUserRegistered = await findById(progress.userId)

      const roleUser = hasUserRegistered?.role?.[0] ?? ''

      return await res.status(200).send({
        status: 200,
        progress: {
          ...progress,
          roleUser
        }
      })
    } catch (err) {
      console.error('Erro inesperado ao obter progresso:', JSON.stringify(err))
      return await res.status(500).send({
        status: 500,
        msg: 'Erro interno no servidor'
      })
    }
  })
}
