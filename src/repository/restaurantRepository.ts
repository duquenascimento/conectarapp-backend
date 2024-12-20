import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'
import { type IRestaurant } from '../service/restaurantService'
import { type addressFormData } from '../service/registerService'
import { v4 as uuidv4 } from 'uuid'

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

export const checkClientCount = async (): Promise<{ externalId: number } | undefined | null> => {
  try {
    return await prisma.clientCount.findFirst({
      select: {
        externalId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    })
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const addClientCount = async (n: number): Promise<void> => {
  try {
    await prisma.clientCount.create({
      data: {
        externalId: n,
        id: uuidv4()
      }
    })
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const removeClientCount = async (): Promise<void> => {
  try {
    await prisma.clientCount.deleteMany({
      where: {}
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
        responsibleReceivingPhoneNumber: req.responsibleReceivingPhoneNumber,
        deliveryReference: '',
        closedDoorDelivery: req.closedDoorDelivery,
        localType: req.localType,
        city: req.city,
        complement: req.complement,
        localNumber: req.localNumber
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

export const updateAddress = async (addressId: string, data: any): Promise<any> => {
  try {
    const result = await prisma.address.update({
      where: {
        id: addressId
      },
      data
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

export const updateComercialBlockRepository = async (restId: string, value: boolean): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      where: {
        externalId: restId
      },
      data: {
        comercialBlock: value
      }
    })
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const updateFinanceBlockRepository = async (restId: string, value: boolean): Promise<void> => {
  try {
    await prisma.restaurant.updateMany({
      where: {
        externalId: restId
      },
      data: {
        financeBlock: value
      }
    })
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}
