import { decode } from 'jsonwebtoken'
import { addClientCount, findAddressByRestaurantId, listByUserId, registerRestaurant, removeClientCount, updateAddress, updateAllowCloseSupplierAndMinimumOrderRepository, updateComercialBlockRepository, updateRegistrationReleasedNewAppRepository, updateFinanceBlockRepository, updateRestaurantRepository, updateAddressByExternalIdRepository, patchRestaurantRepository } from '../repository/restaurantRepository'
import { logRegister } from '../utils/logUtils'
import { type address, type restaurant } from '@prisma/client'

export interface ICreateRestaurantRequest {
  name: string
  user: string
  companyRegistrationNumber: string
  companyRegistrationNumberForBilling: string
  stateRegistrationNumber?: string | null | undefined
}

export interface IRestaurant {
  id: string
  externalId: string
  name: string
  legalName: string
  active: boolean
  phone: string
  alternativePhone: string
  email: string
  alternativeEmail: string
  user: string[]
  address: string[]
  closeDoor: boolean
  favorite: string[]
  weeklyOrderAmount: number
  paymentWay: string
  orderValue: number
  companyRegistrationNumber: string
  companyRegistrationNumberForBilling: string
  stateRegistrationNumber?: string
  cityRegistrationNumber?: string
  createdAt: Date
  updatedAt?: Date
  premium: boolean
}

export const createRestaurant = async (req: IRestaurant): Promise<any> => {
  try {
    await registerRestaurant(req)

    return true
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listRestaurantsByUserId = async (req: { token: string }): Promise<any> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const restaurants: restaurant[] = await listByUserId(decoded.id)

    const newRestaurant = await Promise.all(restaurants.map(async (restaurant: restaurant) => {
      const rest = { ...restaurant, addressInfos: [] as any[] }
      const address: address[] = await findAddressByRestaurantId(restaurant.id)
      rest.addressInfos = address
      return rest
    }))
    return newRestaurant
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateAddressService = async (rest: any): Promise<void> => {
  try {
    const data = rest.addressInfos[0] as address
    await updateAddress(data.id, data)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateComercialBlock = async (req: { restId: string, value: boolean }): Promise<void> => {
  try {
    await updateComercialBlockRepository(req.restId, req.value)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateRegistrationReleasedNewApp = async (req: { restId: string, value: boolean }): Promise<void> => {
  try {
    await updateRegistrationReleasedNewAppRepository(req.restId, req.value)
  } catch (err: any) {
    if (err.cause !== 'visibleError') {
      await logRegister(err)
    }
    throw new Error(err.message, { cause: err.cause })
  }
}

export const updateFinanceBlock = async (req: { restId: string, value: boolean }): Promise<void> => {
  try {
    await updateFinanceBlockRepository(req.restId, req.value)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const AddClientCount = async (req: { count: number }): Promise<void> => {
  try {
    await removeClientCount()
    await addClientCount(req.count)
  } catch (err) {
    console.error(err)
  }
}

export const updateAllowCloseSupplierAndMinimumOrder =
async (req: Pick<restaurant, 'allowClosedSupplier' | 'allowMinimumOrder' | 'externalId'>): Promise<void> => {
  try {
    await updateAllowCloseSupplierAndMinimumOrderRepository(req)
  } catch (err) {
    void logRegister(err)
  }
}

export const updateRestaurant = async (
  externalId: string,
  restaurantData: Partial<restaurant>
): Promise<void> => {
  try {
    await updateRestaurantRepository(externalId, restaurantData)
  } catch (err) {
    void logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateAddressByExternalId = async (
  externalId: string,
  addressData: Partial<address>
): Promise<void> => {
  try {
    await updateAddressByExternalIdRepository(externalId, addressData)
  } catch (err) {
    void logRegister(err)
    throw Error((err as Error).message)
  }
}

export const patchRestaurant = async (
  externalId: string,
  restaurantData: Partial<restaurant>
): Promise<void> => {
  try {
    // Log: Início da operação de atualização parcial

    // Chama o repositório para atualizar os dados no banco de dados
    await patchRestaurantRepository(externalId, restaurantData)

    // Log: Atualização bem-sucedida
  } catch (err) {
    // Log: Captura e registro de erro
    console.error(`[SERVICE] Erro ao atualizar restaurante com externalId ${externalId}:`, err)
    void logRegister(err)
    throw new Error((err as Error).message)
  }
}
