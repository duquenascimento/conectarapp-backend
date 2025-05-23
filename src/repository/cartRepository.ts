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
}

export interface IFindByProductAndUser {
  productId: string
  restaurantId: string
}

export const findCartItemByRestaurantAndProduct = async (
  restaurantId: string,
  productId: string
): Promise<ICartAdd | null> => {
  try {
    const result = await prisma.cart.findFirst({
      where: {
        restaurantId,
        productId,
      },
    });
    return result as ICartAdd | null;
  } catch (err) {
    await logRegister(err);
    return null;
  }
};

export const upsertCartItem = async (cartItem: ICartAdd): Promise<void> => {
  try {
    await prisma.cart.upsert({
      where: { id: cartItem.id },
      create: {
        id: cartItem.id,
        productId: cartItem.productId,
        restaurantId: cartItem.restaurantId,
        amount: cartItem.amount,
        obs: cartItem.obs ?? '',
      },
      update: {
        amount: cartItem.amount,
        obs: cartItem.obs ?? '',
      },
    });
  } catch (err) {
    await logRegister(err);
    throw err;
  }
};
export const addRepository = async (req: ICartAdd): Promise<void> => {
  try {
    await prisma.cart.upsert({
      create: {
        amount: req.amount,
        productId: req.productId,
        id: req.id,
        restaurantId: req.restaurantId,
        obs: req.obs ?? ''
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

export const findByProductAndUser = async (req: IFindByProductAndUser): Promise<cart | null> => {
  try {
    console.log('[findByProductAndUser] >>> Busca itens no carrinho:', req)
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
    console.log('[listByUser] >>> Busca carrinho do restaurante com id:', req.restaurantId)
    const result = await prisma.cart.findMany({
      where: {
        AND: [{ restaurantId: req.restaurantId }]
      },
      select: {
        productId: true,
        amount: true,
        obs: true
      }
    })
    await prisma.$disconnect()

    return result
  } catch (err: any) {
    console.log('[listByUser] >>> Falha ao buscar carrinho do restaurante com id:', req.restaurantId)
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const deleteByUserIdAndProductId = async (id: string): Promise<void> => {
  try {
    console.log('[deleteByUserIdAndProductId] >>> Deleta carrinho com id:', id)
    await prisma.cart.delete({
      where: {
        id
      }
    })
    await prisma.$disconnect()
  } catch (err: any) {
    console.log('[deleteByUserIdAndProductId] >>> Falha ao deletar carrinho com id:', id)
    await prisma.$disconnect()
    await logRegister(err)
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

export const deleteCartItemById = async (id: string): Promise<void> => {
  try {
    await prisma.cart.delete({
      where: { id },
    });
  } catch (err) {
    await logRegister(err);
    throw err;
  }
};
