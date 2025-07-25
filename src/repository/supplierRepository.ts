import { PrismaClient, type supplier } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export const findSupplierByExternalId = async (externalId: string): Promise<supplier | undefined | null> => {
  try {
    const result = await prisma.supplier.findFirst({
      where: { externalId }
    })
    return result
  } catch (err) {
    void logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}
