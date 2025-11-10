import { type address, PrismaClient, type restaurant } from '@prisma/client';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { HttpException } from '../errors/httpException';
import { type addressFormData } from '../service/registerService';
import { type IRestaurant } from '../service/restaurantService';
import { logRecord } from '../utils/log-utility';
import { logRegister } from '../utils/logUtils';

const prisma = new PrismaClient();

export const registerRestaurant = async (req: IRestaurant): Promise<any> => {
  try {
    await prisma.restaurant.create({
      data: req,
    });
  } catch (err: any) {
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const checkClientCount = async (): Promise<{ externalId: number } | undefined | null> => {
  try {
    return await prisma.clientCount.findFirst({
      select: {
        externalId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });
  } catch (err: any) {
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const addClientCount = async (n: number): Promise<void> => {
  try {
    await prisma.clientCount.create({
      data: {
        externalId: n,
        id: uuidv4(),
      },
    });
  } catch (err: any) {
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const removeClientCount = async (): Promise<void> => {
  try {
    await prisma.clientCount.deleteMany({
      where: {},
    });
  } catch (err: any) {
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const registerAddress = async (req: addressFormData): Promise<any> => {
  try {
    const dataRegisterAddress = {
      data: {
        address: req.street,
        zipCode: req.zipcode,
        neighborhood: req.neigh,
        id: req.id,
        restaurant: req.restaurantId,
        active: req.active,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        initialDeliveryTime: req.minHour,
        finalDeliveryTime: req.maxHour,
        deliveryInformation: req.deliveryObs,
        responsibleReceivingName: req.responsibleReceivingName,
        responsibleReceivingPhoneNumber: req.responsibleReceivingPhoneNumber,
        deliveryReference: '',
        closedDoorDelivery: req.closedDoorDelivery,
        localType: req.localType,
        city: req.city,
        complement: req.complement,
        localNumber: req.localNumber,
      },
    };
    await logRecord({
      level: 'info',
      message: 'Dados para registrar endereço',
      data: dataRegisterAddress,
      location: 'restaurantRepository.registerAddress',
    });
    await prisma.address.create(dataRegisterAddress);
  } catch (err: any) {
    await logRecord({
      level: 'error',
      message: 'Error ao registrar endereço',
      data: err,
      location: 'restaurantRepository.registerAddress',
    });
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const findRestaurantByCompanyRegistrationNumber = async (
  companyRegistrationNumber: string,
): Promise<any> => {
  try {
    const result = await prisma.restaurant.findFirst({
      where: {
        companyRegistrationNumber,
      },
    });
    return result;
  } catch (err: any) {
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const findRestaurantByCompanyRegistrationNumberForBilling = async (
  companyRegistrationNumberForBilling: string,
): Promise<any> => {
  try {
    const result = await prisma.restaurant.findFirst({
      where: {
        companyRegistrationNumberForBilling,
      },
    });
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateUserWithRestaurant = async (
  userId: string,
  restaurantId: string,
  updatedAt: Date,
): Promise<any> => {
  try {
    await logRecord({
      level: 'info',
      message: 'Dados para atualizar usuário com restaurante',
      data: { userId, restaurantId, updatedAt },
      location: 'restaurantRepository.updateUserWithRestaurant',
    });
    const result = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: ['registered'],
        restaurant: [restaurantId],
        updatedAt,
      },
    });
    return result;
  } catch (err: any) {
    await logRecord({
      level: 'error',
      message: 'Erro ao atualizar usuário com restaurante',
      data: err,
      location: 'restaurantRepository.updateUserWithRestaurant',
    });
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const listByUserId = async (userId: string): Promise<any> => {
  try {
    const result = await prisma.restaurant.findMany({
      where: {
        user: { has: userId },
      },
    });
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const findAddressByRestaurantId = async (restaurantId: string): Promise<any> => {
  try {
    const result = await prisma.address.findMany({
      where: {
        restaurant: { has: restaurantId },
      },
    });
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateAddress = async (addressId: string, data: any): Promise<any> => {
  try {
    const result = await prisma.address.update({
      where: {
        id: addressId,
      },
      data,
    });
    return result;
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const updateRegistrationReleasedNewAppRepository = async (
  externalId: string,
  registrationReleasedNewApp: boolean,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      where: {
        externalId,
      },
      data: {
        registrationReleasedNewApp,
      },
    });
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateComercialBlockRepository = async (
  restId: string,
  value: boolean,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      where: {
        externalId: restId,
      },
      data: {
        comercialBlock: value,
      },
    });
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateFinanceBlockRepository = async (
  restId: string,
  value: boolean,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      where: {
        externalId: restId,
      },
      data: {
        financeBlock: value,
      },
    });
  } catch (err: any) {
    await prisma.$disconnect();
    await logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateAllowCloseSupplierAndMinimumOrderRepository = async (
  req: Pick<restaurant, 'allowClosedSupplier' | 'allowMinimumOrder' | 'externalId'>,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      data: req,
      where: {
        externalId: req.externalId,
      },
    });
  } catch (err) {
    logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateRestaurantRepository = async (
  externalId: string,
  restaurantData: Partial<restaurant>,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      data: restaurantData,
      where: {
        externalId,
      },
    });
  } catch (err) {
    logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateAddressByExternalIdRepository = async (
  externalId: string,
  addressData: Partial<address>,
): Promise<void> => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        externalId,
      },
      select: {
        address: true,
      },
    });

    if (!restaurant?.address || restaurant.address.length === 0) {
      throw new Error('Restaurante ou endereço não encontrado.');
    }

    const addressId = restaurant.address[0];
    await prisma.address.updateMany({
      data: addressData,
      where: {
        id: addressId,
      },
    });
  } catch (err) {
    logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const patchRestaurantRepository = async (
  externalId: string,
  restaurantData: Partial<restaurant>,
): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      data: restaurantData,
      where: {
        externalId,
      },
    });
  } catch (err) {
    logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const getBlockingSuppliers = async (externalId: string): Promise<string[] | undefined> => {
  try {
    if (!externalId) {
      throw new HttpException('externalId é obrigatório', 422);
    }
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        externalId,
      },
    });
    if (restaurant && restaurant?.blockedBySuppliers.length > 0) {
      return restaurant.blockedBySuppliers;
    }
    return [];
  } catch (err) {
    logRegister(err);
    throw new HttpException('Erro ao buscar fornecedores que bloqueiam o cliente', 500);
  } finally {
    await prisma.$disconnect();
  }
};

export const findRestaurantByExternalId = async (externalId: string): Promise<any> => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { externalId },
    });

    if (!restaurant) {
      throw new Error(`Restaurante com externalId "${externalId}" não encontrado.`);
    }

    return restaurant;
  } catch (err) {
    logRegister(err);
    return null;
  }
};

export const findRestaurantByRestaurantIdAndSupplierId = async (
  restaurantExternalId: string,
  supplierExternalId: string,
): Promise<any> => {
  try {
    if (typeof restaurantExternalId !== 'string' || typeof supplierExternalId !== 'string') {
      throw new Error(
        'Parâmetros inválidos: ambos restaurantExternalId e supplierExternalId devem ser strings',
      );
    }

    return await prisma.restaurant_supplier.findFirst({
      where: {
        restaurant: {
          externalId: restaurantExternalId,
        },
        supplier: {
          externalId: supplierExternalId,
        },
      },
      include: {
        restaurant: true,
        supplier: true,
      },
    });
  } catch (err) {
    logRegister(err);
  }
};

export const findRestaurantById = async (id: string): Promise<any> => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id },
    });

    if (!restaurant) return null;

    const [user, address] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: restaurant.user } },
      }),
      prisma.address.findMany({
        where: { id: { in: restaurant.address } },
      }),
    ]);

    return {
      ...restaurant,
      user,
      address,
    };
  } catch (err) {
    logRegister(err);
  } finally {
    await prisma.$disconnect();
  }
};

export const findConectarPlusAccess = async (
  externalId: string,
): Promise<{ authorized: boolean }> => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { externalId },
      select: { conectarPlusAuthorization: true },
    });
    return { authorized: restaurant?.conectarPlusAuthorization ?? false };
  } catch (err) {
    console.error('Erro ao verificar acesso premium:', err);
    throw new Error('Falha ao consultar o restaurante');
  }
};

export const updateConectarPlusAccess = async (
  externalId: string,
  conectarPlusAuthorization: boolean,
): Promise<{ externalId: string; conectarPlusAuthorization: boolean }> => {
  try {
    const updated = await prisma.restaurant.update({
      where: { externalId },
      data: { conectarPlusAuthorization },
      select: { externalId: true, conectarPlusAuthorization: true },
    });
    return updated;
  } catch (err) {
    console.error('Erro ao atualizar conectarPlus:', err);
    throw new Error('Falha ao atualizar conectarPlus');
  }
};
