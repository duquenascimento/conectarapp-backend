import { PrismaClient, type appVersion } from '@prisma/client'

const prisma = new PrismaClient()

export const createAppVersion = async (data: { externalId: string, version: string, statusId: number, OperationalSystem: string }): Promise<appVersion> => {
  return await prisma.appVersion.create({
    data: {
      externalId: data.externalId,
      version: data.version,
      statusId: data.statusId,
      OperationalSystem: data.OperationalSystem
    }
  })
}

export const updateAppVersion = async (data: { externalId: string, version: string, statusId: number, OperationalSystem: string }): Promise<appVersion> => {
  return await prisma.appVersion.update({
    where: { externalId: data.externalId },
    data: {
      version: data.version,
      statusId: data.statusId,
      OperationalSystem: data.OperationalSystem
    }
  })
}

export const findAppVersionByExternalId = async (externalId: string): Promise<appVersion | null> => {
  return await prisma.appVersion.findFirst({
    where: { externalId }
  })
}
