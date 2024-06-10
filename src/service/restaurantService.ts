import { v4 as uuidv4 } from 'uuid'
import { findRestaurantByCompanyRegistrationNumber, registerRestaurant } from '../repository/restaurantRepository'
import { logRegister } from '../utils/logUtils'
import { DateTime } from 'luxon'

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
  active: boolean
  user: string[]
  address: string[]
  favorite: string[]
  companyRegistrationNumber: string
  stateRegistrationNumber?: string | undefined | null
  createdAt: Date
  updatedAt: Date | null
}

export const createRestaurant = async (req: ICreateRestaurantRequest): Promise<any> => {
  try {
    if (req.companyRegistrationNumber == null || req.companyRegistrationNumberForBilling == null) throw Error('missing company registration number or company registration number for billing', { cause: 'visibleError' })

    const companyRegistrationNumber = await findRestaurantByCompanyRegistrationNumber(req.companyRegistrationNumber)
    if (companyRegistrationNumber != null) throw Error('company registration number already exists')

    const request: IRestaurant = {
      ...req,
      active: true,
      id: uuidv4(),
      createdAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      updatedAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      address: [],
      favorite: [],
      user: [req.user]
    }

    await registerRestaurant(request)

    return true
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
