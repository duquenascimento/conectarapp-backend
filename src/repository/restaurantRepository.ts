import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'
import { type IRestaurant } from '../service/restaurantService'
import { type addressFormData } from '../service/registerService'

const prisma = new PrismaClient()

export const registerRestaurant = async (req: IRestaurant): Promise<any> => {
  try {
    await prisma.restaurant.create({
      data: req
    })
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const registerAddress = async (req: addressFormData): Promise<any> => {
  try {
    await prisma.address.create({
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
        responsibleReceivingName: '',
        responsibleReceivingPhoneNumber: '',
        deliveryReference: '',
        closedDoorDelivery: false
      }
    })
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const findRestaurantByCompanyRegistrationNumber = async (companyRegistrationNumber: string): Promise<any> => {
  try {
    const result = await prisma.restaurant.findFirst({
      where: {
        companyRegistrationNumber
      }
    })
    return result
  } catch (err: any) {
    await logRegister(err)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export const findRestaurantByCompanyRegistrationNumberForBilling = async (companyRegistrationNumberForBilling: string): Promise<any> => {
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
  } finally {
    await prisma.$disconnect()
  }
}

export const updateUserWithRestaurant = async (userId: string, restaurantId: string, updatedAt: Date): Promise<any> => {
  try {
    const result = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        role: ['registered'],
        restaurant: [restaurantId],
        updatedAt
      }
    })
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export const listByUserId = async (userId: string): Promise<any> => {
  try {
    const result = await prisma.restaurant.findMany({
      where: {
        user: { has: userId }
      }
    })
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export const findAddressByRestaurantId = async (restaurantId: string): Promise<any> => {
  try {
    const result = await prisma.address.findMany({
      where: {
        restaurant: { has: restaurantId }
      }
    })
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
