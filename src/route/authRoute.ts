import { type FastifyInstance } from 'fastify'
import { firstStepSignUp, type IFirstStepSignUpRequest, checkLogin, type ICheckLogin, signIn, PwRecoveryCreateService, PwRecoveryCheckService, PwChange } from '../service/authService'

export const authRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/auth/signup', async (req, res): Promise<any> => {
    try {
      const result = await firstStepSignUp(req.body as IFirstStepSignUpRequest)
      if (result == null) throw Error('first step of signUp failed')
      return await res.status(201).send({
        status: 201,
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
          status: 409,
          msg: message
        })
      }
    }
  })

  server.post('/auth/signin', async (req, res): Promise<any> => {
    try {
      const result = await signIn(req.body as IFirstStepSignUpRequest)
      if (result == null) throw Error('signIn failed')
      return await res.status(201).send({
        status: 201,
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
          status: 401,
          msg: message
        })
      }
    }
  })

  server.post('/auth/checkLogin', async (req, res): Promise<any> => {
    try {
      const result = await checkLogin(req.body as ICheckLogin)
      if (result == null) throw Error('not logged')
      return await res.status(200).send({
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
        await res.status(401).send({
          status: 401,
          msg: message
        })
      }
    }
  })

  server.post('/auth/recovery', async (req, res): Promise<any> => {
    try {
      await PwRecoveryCreateService(req.body as { email: string })
      return await res.status(200).send({
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
        await res.status(401).send({
          status: 401,
          msg: message
        })
      }
    }
  })

  server.post('/auth/recoveryCheck', async (req, res): Promise<any> => {
    try {
      await PwRecoveryCheckService(req.body as { email: string; codeSent: string })
      return await res.status(200).send({
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
        await res.status(401).send({
          status: 401,
          msg: message
        })
      }
    }
  })

  server.post('/auth/pwChange', async (req, res): Promise<any> => {
    try {
      await PwChange(req.body as { email: string; codeSent: string; newPW: string })
      return await res.status(200).send({
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
        await res.status(401).send({
          status: 401,
          msg: message
        })
      }
    }
  })
}
