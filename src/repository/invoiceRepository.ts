import { PrismaClient, type order_invoice } from '@prisma/client'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export const upsertInvoice = async (
  orderId: string,
  filePath: string[],
  premium: boolean
): Promise<void> => {
  try {
    await prisma.order_invoice.upsert({
      create: {
        filePath,
        orderId,
        premium,
        status_id: 4
      },
      where: {
        orderId
      },
      update: {
        filePath
      }
    })
  } catch (err) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const findInvoice = async (orderId: string): Promise<order_invoice | null> => {
  return await prisma.order_invoice.findUnique({
    where: {
      orderId
    }
  })
}
