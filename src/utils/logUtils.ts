import { appendFile } from 'fs/promises'
import 'dotenv/config'

export const logRegister = async (err: any): Promise<void> => {
  await appendFile(`${process.env.LOG_PATH}`, `${Date()} - ERROR: ${err}\n`)
  throw Error(process.env.INTERNAL_ERROR_MSG ?? 'internal error, try later.')
}
