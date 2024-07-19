import { findUserByEmail, signInFirstStepUser } from '../repository/authRepository'
import { v4 as uuidv4 } from 'uuid'
import { encryptPassword } from '../utils/authUtils'
import { logRegister } from '../utils/logUtils'
import { sign, verify } from 'jsonwebtoken'
import { DateTime } from 'luxon'

export interface IFirstStepSignUpRequest {
  email: string
  password?: string
}

export interface IFirstStepSignUp {
  email: string
  password?: string
  id: string
  role?: string[]
  restaurant?: string[]
  active: boolean
  createdAt: Date
}

export interface ICheckLogin {
  token: string | undefined | null
}

interface firstStepSignUpResponse {
  token: string
  role: string[]
}

export const firstStepSignUp = async (req: IFirstStepSignUpRequest): Promise<firstStepSignUpResponse | undefined> => {
  try {
    if (req.email == null) throw Error('missing email', { cause: 'visibleError' })
    if (process.env.JWT_SECRET == null) throw Error('missing jwt secret', { cause: 'visibleError' })

    const user = await findUserByEmail(req.email)
    if (user != null) throw Error('email already exists', { cause: 'visibleError' })

    if (req.password != null) {
      const hash = await encryptPassword(req.password)
      if (hash != null) req.password = hash
    }

    const request: IFirstStepSignUp = {
      ...req,
      active: true,
      id: uuidv4(),
      role: ['registering'],
      createdAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate()
    }

    await signInFirstStepUser(request)
    const jwt = sign({
      role: request.role,
      id: request.id,
      email: request.email,
      restaurant: request.restaurant,
      active: request.active,
      createdAt: request.createdAt
    }, process.env.JWT_SECRET)

    return { token: jwt, role: request.role ?? [] }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const checkLogin = async (req: ICheckLogin): Promise<any> => {
  if (req.token == null) return null
  const logged = verify(req.token, process.env.JWT_SECRET ?? '')
  if (logged == null) return null
  return true
}
