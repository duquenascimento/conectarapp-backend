import { decode } from 'jsonwebtoken'
import { findAddressByRestaurantId, listByUserId, registerRestaurant, updateAddress } from '../repository/restaurantRepository'
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
