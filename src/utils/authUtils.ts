import 'dotenv/config'
import { hash, genSalt } from 'bcrypt'

export const encryptPassword = async (password?: string): Promise<string | null> => {
  if (password == null) { Error('missing password'); return null }
  const saltNumber = process.env.SALT ?? 12
  const salt = await genSalt(Number(saltNumber))
  const result = await hash(password, salt)
  return result
}
