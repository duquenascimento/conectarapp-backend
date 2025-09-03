import { appendFile } from 'fs/promises'
import { DateTime } from 'luxon'
import 'dotenv/config'
import path from 'path'
import fs from 'fs'

/**
 * Retorna a data e hora formatada no fuso horário de São Paulo.
 * @returns {string} Data e hora formatada.
 */
const getSãoPauloDate = (): string => {
  const saoPauloDateTime = DateTime.now().setZone('America/Sao_Paulo')
  return saoPauloDateTime.toFormat('yyyy-MM-dd HH:mm:ss')
}

/**
 * Interface para a estrutura de dados de log.
 */
interface LogData {
  level: 'info' | 'error'
  message: string
  data?: any
  location: string
}

/**
 * Registra um log no sistema de arquivos.
 * @param {LogData} logData - Objeto contendo os dados do log.
 * @returns {Promise<void>}
 */
export const logRecord = async ({ level, message, data, location }: LogData): Promise<void> => {
  try {
    const logDir = path.join(process.cwd(), 'logs')
    const logFileName = DateTime.now().toFormat('yyyy-MM-dd') + '.log'
    const logPath = path.join(logDir, logFileName)

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }

    const timestamp = getSãoPauloDate()
    const formattedData = data != null ? ` - data: ${JSON.stringify(data)}` : ''

    const logEntry = `${timestamp} - ${level.toUpperCase()} - ${location} - ${message}${formattedData}\n`

    await appendFile(logPath, logEntry)
  } catch (error) {
    console.error('Error logging the message:', error)
  }
}
