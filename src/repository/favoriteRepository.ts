import { type favorite, PrismaClient } from "@prisma/client";
import "dotenv/config";
import { logRegister } from "../utils/logUtils";
import { type ISaveFavorite } from "../service/favoriteService";

const prisma = new PrismaClient();

export const saveFavorite = async (req: ISaveFavorite): Promise<any> => {
  try {
    const result = await prisma.favorite.upsert({
      create: req,
      update: {},
      where: {
        id: req.id,
      },
    });
    await prisma.$disconnect();
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  }
};

export const findByProductAndUser = async (
  req: ISaveFavorite
): Promise<favorite | null> => {
  try {
    const result = await prisma.favorite.findFirst({
      where: {
        productId: req.productId,
        restaurantId: req.restaurantId,
      },
    });
    await prisma.$disconnect();
    return result;
  } catch (err) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  }
};

export const deleteFavorite = async (id: string): Promise<any> => {
  try {
    const result = await prisma.favorite.delete({
      where: {
        id,
      },
    });
    await prisma.$disconnect();
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  }
};

export const listByUser = async (id: string): Promise<favorite[] | null> => {
  try {
    const result = await prisma.favorite.findMany({
      where: {
        restaurantId: id,
      },
    });
    await prisma.$disconnect();
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  }
};
