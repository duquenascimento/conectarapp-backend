import { PrismaClient, type file_log } from '@prisma/client'

const prisma = new PrismaClient()

export const findFileLog = async (id: string): Promise<file_log | null> => {
  try {
    const log = await prisma.file_log.findUnique({
      where: {
        id
      }
    })

    return log
  } catch (err) {
    console.error('Erro ao buscar file_log:', err)
    throw err
  }
}

export const createFileLog = async (data: Omit<file_log, 'id' | 'createdAt' | 'updatedAt'>): Promise<file_log> => {
  try {
    const log = await prisma.file_log.create({
      data: {
        ...data
      }
    })
    const { id, updatedAt, ...message } = log
    console.log('[FILE LOG]: ', message)
    return log
  } catch (err) {
    console.error('Erro ao criar file_log:', err)
    throw err
  }
}

export const updateFileLog = async (id: string, data: Partial<Omit<file_log, 'id' | 'createdAt' | 'updatedAt'>>): Promise<file_log> => {
  try {
    const log = await findFileLog(id)

    if (!log) {
      throw new Error('Falha na atualização do log. Log não existe')
    }

    const updatedLog = await prisma.file_log.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
    return updatedLog
  } catch (err) {
    console.error('Erro ao atualizar file_log:', err)
    throw err
  }
}
