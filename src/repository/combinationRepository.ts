import { conectar_plus_constraints, PrismaClient } from '@prisma/client';
import { logRegister } from '../utils/logUtils';

const prisma = new PrismaClient();

export async function getCombinationConstraints(): Promise<conectar_plus_constraints | null> {
  try {
    const result = await prisma.conectar_plus_constraints.findMany({});
    return result[0];
  } catch (error) {
    await prisma.$disconnect();
    await logRegister(error);
    return null;
  }
}
