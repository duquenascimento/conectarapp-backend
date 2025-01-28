import { type premiumOrder, PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export interface Order {
  id: string
  restaurantId: string
  addressId: string
  orderDate: Date
  deliveryDate: Date
  orderHour: Date
  paymentWay: string
  referencePoint: string
  initialDeliveryTime: Date
  finalDeliveryTime: Date
  totalSupplier: number
  totalConectar: number
  status_id: number
  detailing: string[]
  tax: number
  supplierId: string
  calcOrderAgain: any
  orderDocument?: string
}

export interface Detailing {
  id: string
  orderId: string
  restaurantId: string
  productId: string
  orderAmount: number
  restaurantFinalAmount: number
  supplierFinalAmount: number
  obs: string
  supplierPricePerUnid: number
  conectarPricePerUnid: number
  status: string
  supplierFinalPrice: number
  conectarFinalPrice: number
  suppliersDetailing: any
  orderUnit?: string
  quotationUnit?: string
  name?: string
}

export const addOrder = async (data: any): Promise<any> => {
  try {
    const result = await prisma.order.create({
      data
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const updateOrder = async (data: any, id: string): Promise<void> => {
  try {
    await prisma.order.update({
      data,
      where: {
        id
      }
    })
  } catch (err: any) {
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const addDetailing = async (data: Detailing[]): Promise<any> => {
  try {
    const result = await prisma.detailing.createMany({
      data
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const checkOrder = async (orderId: string): Promise<any> => {
  try {
    const result = await prisma.order.count({
      where: {
        id: { contains: orderId }
      }
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    console.log(err)
    await logRegister(err)
    return null
  }
}

export const confirmPremium = async ({ orderText, Date, restaurantId, id, cart }: premiumOrder): Promise<any> => {
  try {
    const result = await prisma.premiumOrder.create({
      data: {
        orderText,
        id,
        restaurantId,
        Date,
        cart: JSON.stringify(JSON.parse((cart) as string))
      }
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    console.log(err)
    await logRegister(err)
    return null
  }
}
