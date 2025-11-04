import { PrismaClient } from '@prisma/client';
import { logRegister } from '../utils/logUtils';

const prisma = new PrismaClient();

export const findById = async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (err) {
    await logRegister(err);
    throw Error((err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
};

export const softDeleteUser = async (id: string) => {
  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  } catch (err) {
    await logRegister(err);
    throw Error((err as Error).message);
  } finally {
    await prisma.$disconnect();
  }
};
