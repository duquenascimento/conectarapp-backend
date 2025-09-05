import { appendFile } from 'fs/promises'
import { DateTime } from 'luxon'
import 'dotenv/config'
import path from 'path'
import * as fs from 'fs'

const getSaoPauloDate = (): string => {
  const saoPauloDateTime = DateTime.now().setZone('America/Sao_Paulo')
  return saoPauloDateTime.toFormat('yyyy-MM-dd HH:mm:ss')
}

export const logRegister = async (err: any, rethrow = true): Promise<void> => {
  try {
    console.error(err)
    const logDir = path.join(process.cwd(), 'logs')
    const logFileName = DateTime.now().toFormat('yyyy-MM-dd') + '.log'
    const logPath = path.join(logDir, logFileName)

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }

    const timestamp = getSaoPauloDate()
    const errorMessage = err instanceof Error ? err.message : String(err)

    await appendFile(logPath, `${timestamp} - ERROR: ${errorMessage}\n`)
  } catch (loggingError) {
    console.error('Error logging the message:', loggingError)
  } finally {
    if (rethrow) {
      const customMsg = process.env.INTERNAL_ERROR_MSG
      const finalError = customMsg
        ? new Error(customMsg)
        : err instanceof Error
        ? err
        : new Error(String(err))

      throw finalError
    }
  }
}
