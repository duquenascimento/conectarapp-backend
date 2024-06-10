import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'
import { type IRestaurant } from '../service/restaurantService'

const prisma = new PrismaClient()

export const registerRestaurant = async (req: IRestaurant): Promise<any> => {
  try {
    const result = prisma.restaurant
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  }
}

export const findRestaurantByCompanyRegistrationNumber = async (companyRegistrationNumber: string): Promise<IRestaurant | null> => {
  try {
    const result = await prisma.restaurant.findFirst({
      where: {
        companyRegistrationNumber
      }
    })
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const findRestaurantByCompanyRegistrationNumberForBilling = async (companyRegistrationNumberForBilling: string): Promise<IRestaurant | null> => {
  try {
    const result = await prisma.restaurant.findFirst({
      where: {
        companyRegistrationNumberForBilling
      }
    })
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}
