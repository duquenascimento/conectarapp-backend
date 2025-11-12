import { PrismaClient, type appVersion } from '@prisma/client';

const prisma = new PrismaClient();

export const createAppVersion = async (data: {
  externalId: string;
  version: string;
  statusId: number;
  OperationalSystem: string;
}): Promise<appVersion> => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { externalId: data.externalId },
  });

  if (!restaurant) {
    throw new Error(`Restaurante com externalId '${data.externalId}' não encontrado.`);
  }

  return prisma.appVersion.create({
    data: {
      externalId: data.externalId,
      version: data.version,
      statusId: data.statusId ?? null,
      OperationalSystem: data.OperationalSystem,
    },
    include: {
      status: {
        select: {
          id: true,
          description: true,
        },
      },
    },
  });
};

export const updateAppVersion = async (data: {
  externalId: string;
  version: string;
  statusId: number;
  OperationalSystem: string;
}) => {
  return prisma.appVersion.update({
    where: {
      externalId: data.externalId,
    },
    data: {
      version: data.version,
      statusId: data.statusId ?? null,
      OperationalSystem: data.OperationalSystem,
    },
    include: {
      status: {
        select: {
          id: true,
          description: true,
        },
      },
    },
  });
};

export const findAppVersionByExternalId = async (
  externalId: string,
): Promise<appVersion | null> => {
  return prisma.appVersion.findFirst({
    where: { externalId },
  });
};
