import { type user } from '@prisma/client'
import { findById } from '../repository/userRepository'
import { logRegister } from '../utils/logUtils'

export const findUserById = async (id?: string): Promise<user> => {
  try {
    const result = await findById(id ?? '')
    if (result == null) throw new Error('not found', { cause: 'visibleError' })
    return result
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
