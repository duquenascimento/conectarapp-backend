import { type order, PrismaClient } from '@prisma/client'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export const findById = async (id: string): Promise<order | null | undefined> => {
  try {
    return await prisma.order.findUnique({ where: { id } })
  } catch (err) {
    void logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const cancelById = async (id: string): Promise<void> => {
  try {
    await prisma.order.update({ where: { id }, data: { status_id: 6 } })
  } catch (err) {
    void logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}
