import { decode } from 'jsonwebtoken'
import { addRepository, deleteByUserId, deleteByUserIdAndProductId, findByProductAndUser, type ICartAdd, listByUser } from '../repository/cartRepository'
import { logRegister } from '../utils/logUtils'
import { v4 as uuidv4 } from 'uuid'
import { Decimal } from '@prisma/client/runtime/library'
import { countCartItens } from '../repository/cartRepository'

export interface ICartAddRequest {
  amount: number
  obs: string
  productId: string
  addOrder: number
}

export interface ICartAddRequestArray {
  carts: ICartAddRequest[]
  cartToExclude: ICartAddRequest[]
  token: string
  selectedRestaurant: { id: string }
}

export interface ICartList {
  token: string
  selectedRestaurant: any
}

export interface ICartDeleteItem {
  token: string
  productId: string
  selectedRestaurant: { id: string }
}

export interface ICartResponse {
  productId: string
  amount: Decimal
  obs: string | null
  sku?: string
  addOrder: number | null
}

interface Product {
  name: string
  orderUnit: string
  quotationUnit: string
  convertedWeight: number
  class: string
  sku: string
  id: string
  active: true
  createdBy: string
  createdAt: string
  changedBy: string
  updatedAt: string
  image: string[]
  favorite?: boolean
  obs: string | null
  amount: Decimal
  mediumWeight: number
  firstUnit: number
  secondUnit: number
  thirdUnit: number
  addOrder: number
}

const addToCart = async (req: ICartAddRequest, restaurantId: string): Promise<void> => {
  if (!req.productId) throw new Error('Produto inválido.')
  if (typeof restaurantId !== 'string') throw new Error('Restaurante inválido.')

  const request: ICartAdd = {
    ...req,
    id: uuidv4(),
    restaurantId,
    addOrder: req.addOrder
  }

  const result = await findByProductAndUser({
    productId: req.productId,
    restaurantId
  })

  if (result != null) request.id = result.id

  if (request.amount === 0) {
    await deleteByUserIdAndProductId(request.id)
    return
  }

  await addRepository(request)
}

const deleteItens = async (req: ICartAddRequest, restaurantId: string): Promise<void> => {
  if (!req.productId || typeof restaurantId !== 'string') return

  const result = await findByProductAndUser({
    productId: req.productId,
    restaurantId
  })

  if (!result) return

  await deleteByUserIdAndProductId(result.id)
}

export const deleteItem = async (req: ICartDeleteItem): Promise<void> => {
  if (!req.selectedRestaurant?.id || !req.productId) {
    throw new Error('selectedRestaurant.id ou productId ausente na requisição para delete')
  }

  const result = await findByProductAndUser({
    productId: req.productId,
    restaurantId: req.selectedRestaurant.id
  })

  if (!result) {
    console.warn(`Item não encontrado no carrinho para deletar: ${req.productId}`)
    return
  }

  await deleteByUserIdAndProductId(result.id)
}

export const addService = async (req: ICartAddRequestArray): Promise<void> => {
  try {
    if (!req.token || !req.selectedRestaurant?.id) {
      throw new Error('Token ou selectedRestaurant.id ausente na requisição.')
    }

    const countItens = await countCartItens(req.selectedRestaurant.id)
    let orderIndex = countItens

    for (const cart of req.carts) {
      if (!cart.productId || cart.amount == null) continue

      orderIndex++
      cart.addOrder = orderIndex
      await addToCart(cart, req.selectedRestaurant.id)
    }

    await Promise.all(
      req.cartToExclude.map(async (cartToDelete) => {
        await deleteItens(cartToDelete, req.selectedRestaurant.id)
      })
    )
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listCart = async (req: ICartList): Promise<ICartResponse[] | null> => {
  try {
    if (!req.selectedRestaurant?.id) throw new Error('selectedRestaurant.id ausente')

    const result = await listByUser({ restaurantId: req.selectedRestaurant.id })
    return result ?? null
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listCartComplete = async (req: ICartList): Promise<ICartResponse[] | null> => {
  try {
    if (!req.selectedRestaurant?.id) throw new Error('selectedRestaurant.id ausente')

    const result = await listByUser({ restaurantId: req.selectedRestaurant.id })
    if (result == null) return null
    const myHeaders = new Headers()
    myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
    myHeaders.append('external-id', 'F0')
    myHeaders.append('username', 'contato@conectarhortifruti.com.br')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=')
    myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys')

    const raw = JSON.stringify({
      ids: result?.map((item) => item.productId)
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    }

    const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/listFavoriteProductToApp', requestOptions)
    let data = await res.json()
    data = data.data.map((item: Product) => {
      const produto = result.find((x) => x.productId === item.id)
      return {
        id: item.id,
        image: item.image,
        class: item.class,
        active: item.active,
        changedBy: item.changedBy,
        mediumWeight: item.mediumWeight,
        firstUnit: item.firstUnit,
        secondUnit: item.secondUnit,
        thirdUnit: item.thirdUnit,
        convertedWeight: item.convertedWeight,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
        name: item.name,
        orderUnit: item.orderUnit,
        quotationUnit: item.quotationUnit,
        sku: item.sku,
        updatedAt: item.updatedAt,
        amount: produto?.amount ?? new Decimal(0),
        obs: produto?.obs ?? '',
        addOrder: produto?.addOrder ?? 0
      } satisfies Product
    })

    return data
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const deleteCartByUser = async (req: ICartList): Promise<void> => {
  try {
    if (typeof req.selectedRestaurant?.id !== 'string') {
      throw new Error('selectedRestaurant.id está ausente na requisição')
    }
    await deleteByUserId(req.selectedRestaurant.id as string)
  } catch (err: any) {
    if (err.cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
