import { PrismaClient } from '@prisma/client'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export const upsertRegisterProgress = async (userId: string, step: number, values: any): Promise<any> => {
  try {
    await prisma.register_progress.upsert({
      where: { userId },
      update: { step, values, updatedAt: new Date() },
      create: { userId, step, values, updatedAt: new Date() }
    })
  } catch (error) {
    await logRegister(error)
  }
}

export const findRegisterProgressByUser = async (userId: string): Promise<any> => {
  try {
    const progress = await prisma.register_progress.findUnique({
      where: { userId }
    })
    return progress
  } catch (error) {
    await logRegister(error)
  }
}
