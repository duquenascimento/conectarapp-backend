import { decode } from 'jsonwebtoken'
import { addClientCount, findAddressByRestaurantId, listByUserId, registerRestaurant, removeClientCount, updateAddress, updateAllowCloseSupplierAndMinimumOrderRepository, updateRegistrationReleasedNewAppRepository, updateFinanceBlockRepository, updateRestaurantRepository, updateAddressByExternalIdRepository, patchRestaurantRepository, updateComercialBlockRepository } from '../repository/restaurantRepository'
import { logRegister } from '../utils/logUtils'
import { type address, type restaurant } from '@prisma/client'
import { updateAddressRegisterAirtable, findRecordIdByClientId } from '../repository/airtableRegisterService'

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

    const newRestaurant = await Promise.all(
      restaurants.map(async (restaurant: restaurant) => {
        const rest = { ...restaurant, addressInfos: [] as any[] }
        const address: address[] = await findAddressByRestaurantId(restaurant.id)
        rest.addressInfos = address
        return rest
      })
    )
    return newRestaurant
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateAddressService = async (rest: any): Promise<void> => {
  try {
    const data = rest.addressInfos[0] as address
    const restaurantData = rest as unknown as restaurant
    const externalId = restaurantData.externalId

    // Atualiza os dados no banco de dados
    await updateAddress(data.id, data)
    
    const airtableRecordId = await findRecordIdByClientId(externalId)
    if (!airtableRecordId) throw new Error('Registro do cliente não encontrado no Airtable')

    const updateAirtableRecord = await updateAddressRegisterAirtable({
      'ID_Cliente': airtableRecordId,
      'Número': data.localNumber ?? '',
      'Rua': `${data.address} ${data.localType}`,
      'Resp. recebimento': data.responsibleReceivingName,
      'Tel resp. recebimento': data.responsibleReceivingPhoneNumber,
      'Complemento': data.complement ?? '',
      'CEP': data.zipCode,
      'Bairro String': data.neighborhood,
      'Cidade String': data.city ?? '',
      'Informações de entrega': data.deliveryInformation
    })

    if (!updateAirtableRecord || typeof updateAirtableRecord !== 'object' || !('fields' in updateAirtableRecord)) {
      throw new Error('Falha ao atualizar registro no Airtable ou estrutura do registro inválida')
    }

    if (!updateAirtableRecord.fields || typeof updateAirtableRecord.fields !== 'object' || !('ID_Cliente' in updateAirtableRecord.fields)) {
      throw new Error('ID_Cliente não encontrado no registro do Airtable')
    }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateRegistrationReleasedNewApp = async (req: { externalId: string; registrationReleasedNewApp: boolean }): Promise<void> => {
  try {
    await updateRegistrationReleasedNewAppRepository(req.externalId, req.registrationReleasedNewApp)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateComercialBlock = async (req: { restId: string; value: boolean }): Promise<void> => {
  try {
    await updateComercialBlockRepository(req.restId, req.value)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateFinanceBlock = async (req: { restId: string; value: boolean }): Promise<void> => {
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

export const updateAllowCloseSupplierAndMinimumOrder = async (req: Pick<restaurant, 'allowClosedSupplier' | 'allowMinimumOrder' | 'externalId'>): Promise<void> => {
  try {
    await updateAllowCloseSupplierAndMinimumOrderRepository(req)
  } catch (err) {
    void logRegister(err)
  }
}

export const updateRestaurant = async (externalId: string, restaurantData: Partial<restaurant>): Promise<void> => {
  try {
    await updateRestaurantRepository(externalId, restaurantData)
  } catch (err) {
    void logRegister(err)
    throw Error((err as Error).message)
  }
}

export const updateAddressByExternalId = async (externalId: string, addressData: Partial<address>): Promise<void> => {
  try {
    await updateAddressByExternalIdRepository(externalId, addressData)
  } catch (err) {
    void logRegister(err)
    throw Error((err as Error).message)
  }
}

export const patchRestaurant = async (externalId: string, restaurantData: Partial<restaurant>): Promise<void> => {
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
