import { type cart, PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRegister } from '../utils/logUtils'
import { type ICartResponse } from '../service/cartService'

const prisma = new PrismaClient()

export interface ICartAdd {
  amount: number
  obs: string
  productId: string
  id: string
  restaurantId: string
  addOrder: number
}

export interface IFindByProductAndUser {
  productId: string
  restaurantId: string
}

export const addRepository = async (req: ICartAdd): Promise<void> => {
  try {
    await prisma.cart.upsert({
      create: {
        amount: req.amount,
        productId: req.productId,
        id: req.id,
        restaurantId: req.restaurantId,
        obs: req.obs ?? '',
        addOrder: req.addOrder
      },
      update: {
        amount: req.amount,
        obs: req.obs
      },
      where: {
        id: req.id
      }
    })
    await prisma.$disconnect()
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  }
}

export const countCartItens = async (restaurantId: string): Promise<number> => {
  const itemQuantity = await prisma.cart.count({
    where: { restaurantId }
  })
  return itemQuantity
}

export const findByProductAndUser = async (req: IFindByProductAndUser): Promise<cart | null> => {
  try {
    const result = await prisma.cart.findFirst({
      where: {
        AND: [{ productId: req.productId, restaurantId: req.restaurantId }]
      }
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const listByUser = async (req: any): Promise<ICartResponse[] | null> => {
  try {
    const result = await prisma.cart.findMany({
      where: {
        AND: [{ restaurantId: req.restaurantId }]
      },
      select: {
        productId: true,
        amount: true,
        obs: true,
        addOrder: true
      }
    })
    await prisma.$disconnect()

    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const deleteByUserIdAndProductId = async (id: string): Promise<void> => {
  try {
    await prisma.cart.delete({
      where: {
        id
      }
    })
    await prisma.$disconnect()
  } catch (err: any) {
    if (err.code === 'P2025') {
      console.warn(`Tentou deletar cart.id inexistente: ${id}`)
      return
    }

    await logRegister(err)
    throw err
  }
}

export const deleteByUserId = async (id: string): Promise<void> => {
  try {
    await prisma.cart.deleteMany({
      where: {
        restaurantId: id
      }
    })
    await prisma.$disconnect()
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  }
}
