import { type address, type restaurant } from '@prisma/client';
import { decode } from 'jsonwebtoken';
import {
  findRecordIdByClientId,
  updateAddressRegisterAirtable,
  updateUserAirtable,
} from '../repository/airtableRegisterService';
import {
  addClientCount,
  findAddressByRestaurantId,
  findConectarPlusAccess,
  findRestaurantByExternalId,
  findRestaurantById,
  findRestaurantByRestaurantIdAndSupplierId,
  listByUserId,
  patchRestaurantRepository,
  registerRestaurant,
  removeClientCount,
  updateAddress,
  updateAddressByExternalIdRepository,
  updateAllowCloseSupplierAndMinimumOrderRepository,
  updateComercialBlockRepository,
  updateConectarPlusAccess,
  updateFinanceBlockRepository,
  updateRegistrationReleasedNewAppRepository,
  updateRestaurantRepository,
} from '../repository/restaurantRepository';
import { logRecord } from '../utils/log-utility';
import { logRegister } from '../utils/logUtils';

export interface ICreateRestaurantRequest {
  name: string;
  user: string;
  companyRegistrationNumber: string;
  companyRegistrationNumberForBilling: string;
  stateRegistrationNumber?: string | null | undefined;
}

export interface IRestaurant {
  id: string;
  externalId: string;
  name: string;
  legalName: string;
  active: boolean;
  phone: string;
  alternativePhone: string;
  email: string;
  alternativeEmail: string;
  user: string[];
  address: string[];
  closeDoor: boolean;
  favorite: string[];
  weeklyOrderAmount: number;
  paymentWay: string;
  orderValue: number;
  companyRegistrationNumber: string;
  companyRegistrationNumberForBilling: string;
  stateRegistrationNumber?: string;
  cityRegistrationNumber?: string;
  createdAt: Date;
  updatedAt?: Date;
  premium: boolean;
}

export const createRestaurant = async (req: IRestaurant): Promise<any> => {
  await logRecord({
    level: 'info',
    message: 'Dados para criar Restaurante',
    data: req,
    location: 'restaurantService.createRestaurant',
  });
  try {
    await registerRestaurant(req);

    const dataUserRecord = {
      ID_Usuário: req.user[0],
      'Restaurantes associados Novo': req.externalId,
    };

    const airtableUserRecord = await updateUserAirtable(dataUserRecord);

    if (
      !airtableUserRecord ||
      typeof airtableUserRecord !== 'object' ||
      !('fields' in airtableUserRecord)
    ) {
      await logRecord({
        level: 'error',
        message:
          'Falha ao cadastrar externalId no cadastro do Airtable ou estrutura do registro inválida',
        data: dataUserRecord,
        location: 'restaurantService.createRestaurant',
      });
      throw new Error(
        'Falha ao cadastrar externalId no cadastro do Airtable ou estrutura do registro inválida',
      );
    }

    if (
      !airtableUserRecord.fields ||
      typeof airtableUserRecord.fields !== 'object' ||
      !('ID_Usuário' in airtableUserRecord.fields)
    ) {
      await logRecord({
        level: 'error',
        message: 'ID_Usuário não encontrado no registro do Airtable',
        data: dataUserRecord,
        location: 'restaurantService.createRestaurant',
      });
      throw new Error('ID_Usuário não encontrado no registro do Airtable');
    }

    return true;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const findByExternalId = async (externalId: string): Promise<any> => {
  try {
    const restaurant = await findRestaurantByExternalId(externalId);
    return restaurant;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const findByRestaurantIdAndSupplierId = async (
  restaurantExternalId: string,
  supplierExternalId: string,
): Promise<any> => {
  try {
    const restaurantSupplier = await findRestaurantByRestaurantIdAndSupplierId(
      restaurantExternalId,
      supplierExternalId,
    );
    return restaurantSupplier;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const listRestaurantsByUserId = async (req: { token: string }): Promise<any> => {
  try {
    const decoded = decode(req.token) as { id: string };
    const restaurants: restaurant[] = await listByUserId(decoded.id);

    const newRestaurant = await Promise.all(
      restaurants.map(async (restaurant: restaurant) => {
        const rest = { ...restaurant, addressInfos: [] as any[] };
        const address: address[] = await findAddressByRestaurantId(restaurant.id);
        rest.addressInfos = address;
        return rest;
      }),
    );
    return newRestaurant;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const updateAddressService = async (rest: any): Promise<void> => {
  try {
    const data = rest.addressInfos[0] as address;
    const restaurantData = rest as unknown as restaurant;
    const { externalId } = restaurantData;

    // Atualiza os dados no banco de dados
    await updateAddress(data.id, data);

    const safeParseDate = (value: unknown, fieldName: string): Date => {
      const date = new Date(value as string);

      const isValidDate = date instanceof Date && !Number.isNaN(date.getTime());
      if (!isValidDate) {
        throw new Error(`Campo "${fieldName}" inválido ou ausente: ${value}`);
      }

      return date;
    };

    const initialDeliveryTime = safeParseDate(data.initialDeliveryTime, 'initialDeliveryTime');
    const finalDeliveryTime = safeParseDate(data.finalDeliveryTime, 'finalDeliveryTime');

    const toHourMinute = (date: Date): string => {
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const airtableRecordId = await findRecordIdByClientId(externalId);
    if (!airtableRecordId) throw new Error('Registro do cliente não encontrado no Airtable');

    const updateAirtableRecord = await updateAddressRegisterAirtable({
      ID_Cliente: airtableRecordId,
      Número: data.localNumber ?? '',
      Rua: `${data.localType} ${data.address}`,
      'Resp. recebimento': data.responsibleReceivingName ?? '',
      'Tel resp. recebimento': data.responsibleReceivingPhoneNumber ?? '',
      Complemento: data.complement ?? '',
      CEP: data.zipCode,
      'h_min seg': toHourMinute(initialDeliveryTime),
      'h_max seg': toHourMinute(finalDeliveryTime),
      'h_min ter': toHourMinute(initialDeliveryTime),
      'h_max ter': toHourMinute(finalDeliveryTime),
      'h_min qua': toHourMinute(initialDeliveryTime),
      'h_max qua': toHourMinute(finalDeliveryTime),
      'h_min qui': toHourMinute(initialDeliveryTime),
      'h_max qui': toHourMinute(finalDeliveryTime),
      'h_min sex': toHourMinute(initialDeliveryTime),
      'h_max sex': toHourMinute(finalDeliveryTime),
      'h_min sab': toHourMinute(initialDeliveryTime),
      'h_max sab': toHourMinute(finalDeliveryTime),
      'h_min dom': toHourMinute(initialDeliveryTime),
      'h_max dom': toHourMinute(finalDeliveryTime),
      'Bairro String': data.neighborhood,
      'Cidade String': data.city ?? '',
      'Informações de entrega': data.deliveryInformation,
    });

    if (
      !updateAirtableRecord ||
      typeof updateAirtableRecord !== 'object' ||
      !('fields' in updateAirtableRecord)
    ) {
      throw new Error('Falha ao atualizar registro no Airtable ou estrutura do registro inválida');
    }

    if (
      !updateAirtableRecord.fields ||
      typeof updateAirtableRecord.fields !== 'object' ||
      !('ID_Cliente' in updateAirtableRecord.fields)
    ) {
      throw new Error('ID_Cliente não encontrado no registro do Airtable');
    }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const updateRegistrationReleasedNewApp = async (req: {
  externalId: string;
  registrationReleasedNewApp: boolean;
}): Promise<void> => {
  try {
    await updateRegistrationReleasedNewAppRepository(
      req.externalId,
      req.registrationReleasedNewApp,
    );
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const updateComercialBlock = async (req: {
  restId: string;
  value: boolean;
}): Promise<void> => {
  try {
    await updateComercialBlockRepository(req.restId, req.value);
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const updateFinanceBlock = async (req: {
  restId: string;
  value: boolean;
}): Promise<void> => {
  try {
    await updateFinanceBlockRepository(req.restId, req.value);
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const AddClientCount = async (req: { count: number }): Promise<void> => {
  try {
    await removeClientCount();
    await addClientCount(req.count);
  } catch (err) {
    console.error(err);
  }
};

export const updateAllowCloseSupplierAndMinimumOrder = async (
  req: Pick<restaurant, 'allowClosedSupplier' | 'allowMinimumOrder' | 'externalId'>,
): Promise<void> => {
  try {
    await updateAllowCloseSupplierAndMinimumOrderRepository(req);
  } catch (err) {
    logRegister(err);
  }
};

export const updateRestaurant = async (
  externalId: string,
  restaurantData: Partial<restaurant>,
): Promise<void> => {
  try {
    await updateRestaurantRepository(externalId, restaurantData);
  } catch (err) {
    logRegister(err);
    throw Error((err as Error).message);
  }
};

export const updateAddressByExternalId = async (
  externalId: string,
  addressData: Partial<address>,
): Promise<void> => {
  try {
    await updateAddressByExternalIdRepository(externalId, addressData);
  } catch (err) {
    logRegister(err);
    throw Error((err as Error).message);
  }
};

export const patchRestaurant = async (
  externalId: string,
  restaurantData: Partial<restaurant>,
): Promise<void> => {
  try {
    // Log: Início da operação de atualização parcial

    // Chama o repositório para atualizar os dados no banco de dados
    await patchRestaurantRepository(externalId, restaurantData);

    // Log: Atualização bem-sucedida
  } catch (err) {
    // Log: Captura e registro de erro
    console.error(`[SERVICE] Erro ao atualizar restaurante com externalId ${externalId}:`, err);
    logRegister(err);
    throw new Error((err as Error).message);
  }
};

export const findById = async (restaurantId: string) => {
  return findRestaurantById(restaurantId);
};

export const findConectarPlus = async (externalId: string): Promise<{ authorized: boolean }> => {
  return findConectarPlusAccess(externalId);
};

export const setConectarPlus = async (externalId: string, conectarPlusAuthorization: boolean) => {
  if (!externalId) {
    throw new Error('externalId é obrigatório');
  }
  if (typeof conectarPlusAuthorization !== 'boolean') {
    throw new Error('O valor de conectarPlus deve ser boolean');
  }

  return updateConectarPlusAccess(externalId, conectarPlusAuthorization);
};

export const getRestaurantMaxSpecificSuppliers = async (externalId: string): Promise<number> => {
  const restaurant = await findRestaurantByExternalId(externalId);

  return restaurant?.max_specific_suppliers || 0;
};
