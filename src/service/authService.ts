import { changePassword, checkCode, createCode, findUserByEmail, signInFirstStepUser } from '../repository/authRepository'
import { v4 as uuidv4 } from 'uuid'
import { encryptPassword, verifyPassword } from '../utils/authUtils'
import { logRegister } from '../utils/logUtils'
import { sign, verify } from 'jsonwebtoken'
import { DateTime } from 'luxon'
import { generateRandomSequenceObject, sendEmail } from '../utils/utils'
import { createUserAirtable } from '../repository/airtableRegisterService'

export interface IFirstStepSignUpRequest {
  email: string
  password?: string
  name?: string
  phone?: string
  position?: string
}

export interface IFirstStepSignUp {
  email: string
  password?: string
  id: string
  name?: string
  phone?: string
  position?: string
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
    const jwt = sign(
      {
        role: request.role,
        id: request.id,
        email: request.email,
        restaurant: request.restaurant,
        active: request.active,
        createdAt: request.createdAt
      },
      process.env.JWT_SECRET
    )

    const airtableUserRecord = await createUserAirtable({
      ID_Usuário: request.id,
      'Nome usuário': request.name ?? '',
      Cargo: request.position ?? 'Outros',
      'Telefone usuário': request.phone ?? '',
      'Email login': request.email
    })

    if (!airtableUserRecord || typeof airtableUserRecord !== 'object' || !('fields' in airtableUserRecord)) {
      throw new Error('Falha ao criar registro de cadastro no Airtable ou estrutura do registro inválida')
    }

    if (!airtableUserRecord.fields || typeof airtableUserRecord.fields !== 'object' || !('ID_Usuário' in airtableUserRecord.fields)) {
      throw new Error('ID_Usuário não encontrado no registro do Airtable')
    }

    return { token: jwt, role: request.role ?? [] }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const signIn = async (req: IFirstStepSignUpRequest): Promise<firstStepSignUpResponse | undefined> => {
  try {
    if (req.email == null) throw Error('missing email', { cause: 'visibleError' })
    if (process.env.JWT_SECRET == null) throw Error('missing jwt secret')
    if (req.password == null) throw Error('missing password', { cause: 'visibleError' })

    const user = await findUserByEmail(req.email)
    if (user == null) throw Error('user not found', { cause: 'visibleError' })
    const valid = await verifyPassword(req.password, user.password ?? '')
    if (!valid) throw Error('invalid password', { cause: 'visibleError' })

    const jwt = sign(
      {
        role: user.role,
        id: user.id,
        email: user.email,
        restaurant: user.restaurant,
        active: user.active,
        createdAt: user.createdAt
      },
      process.env.JWT_SECRET
    )

    return { token: jwt, role: user.role ?? [] }
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

export const PwRecoveryCreateService = async (req: { email: string }): Promise<void> => {
  try {
    const user = await findUserByEmail(req.email)
    if (user == null) throw Error('user not exist', { cause: 'visibleError' })
    const code = generateRandomSequenceObject()

    await createCode({ code: Object.values(code).join(''), id: uuidv4(), identifier: req.email, createdAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate() })
    await sendEmail(code, req.email, process.env.SENDGRID_TEMPLATE_PASSWORD_RECOVERY ?? '')
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const PwRecoveryCheckService = async (req: { email: string; codeSent: string }): Promise<void> => {
  try {
    const code = await checkCode({ identifier: req.email })
    if ((code?.code ?? '') !== req.codeSent) throw Error('invalid code', { cause: 'visibleError' })
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const PwChange = async (req: { email: string; codeSent: string; newPW: string }): Promise<void> => {
  try {
    await PwRecoveryCheckService(req)
    const hashPassword = await encryptPassword(req.newPW)
    if (hashPassword == null) throw Error('invalid pw', { cause: 'visibleError' })
    await changePassword({ email: req.email, password: hashPassword })
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const checkPremiumAccess = async (externalId: string): Promise<any> => {
  const authorizedIds = (process.env.CONECTAR_PLUS_AUTH_IDS ?? '').split(',').map((id) => id.trim())
  if (authorizedIds.includes(externalId)) {
    return {
      authorized: true
    }
  }
  return {
    authorized: false
  }
}
