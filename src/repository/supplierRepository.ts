import { PrismaClient, type supplier } from '@prisma/client';
import 'dotenv/config';
import { logRegister } from '../utils/logUtils';

const prisma = new PrismaClient();

export const findSupplierByExternalId = async (
  externalId: string,
): Promise<supplier | undefined | null> => {
  try {
    const result = await prisma.supplier.findFirst({
      where: { externalId },
    });
    return result;
  } catch (err) {
    logRegister(err);
    return null;
  }
};

export async function getSuppliersIdsByReferralRestaurantId(
  referralRestaurantId: string,
): Promise<string[]> {
  try {
    const suppliersResult = await prisma.supplier.findMany({
      where: {
        referral_restaurant_id: referralRestaurantId,
      },
    });

    return suppliersResult.map((sup) => sup.externalId);
  } catch (error) {
    logRegister(error);
    return [];
  }
}
