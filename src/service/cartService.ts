import { decode } from 'jsonwebtoken'
import {
  addRepository,
  deleteByUserId,
  deleteByUserIdAndProductId,
  findByProductAndUser,
  type ICartAdd,
  listByUser
} from '../repository/cartRepository'
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
}

export interface ICartList {
  token: string
  selectedRestaurant: any
}

export interface ICartDeleteItem {
  token: string
  productId: string
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

const addToCart = async (req: ICartAddRequest, id: string): Promise<void> => {
  const existingItem = await findByProductAndUser({
    productId: req.productId,
    restaurantId: id
  })

  const request: ICartAdd = {
    ...req,
    id: existingItem?.id ?? uuidv4(),
    restaurantId: id,
    addOrder: req.addOrder
  }

  if (request.amount === 0) {
    await deleteByUserIdAndProductId(request.id)
  }
  await addRepository(request)
}

const deleteItens = async (req: ICartAddRequest, id: string): Promise<void> => {
  const result = await findByProductAndUser({
    productId: req.productId,
    restaurantId: id
  })
  if (result == null) return
  await deleteByUserIdAndProductId(result.id)
}

export const deleteItem = async (req: ICartDeleteItem): Promise<void> => {
  const decoded = decode(req.token) as { id: string }
  const result = await findByProductAndUser({
    productId: req.productId,
    restaurantId: decoded.id
  })

  if (result == null) return
  await deleteByUserIdAndProductId(result.id)
}

export const addService = async (req: ICartAddRequestArray): Promise<void> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const restaurantId = decoded.id

    const countItens = await countCartItens(restaurantId)
    let orderIndex = countItens
    for (const cart of req.carts) {
      orderIndex++
      cart.addOrder = orderIndex
    }

    const addResults = await Promise.allSettled(
      req.carts.map(async (cart) => {
        await addToCart(cart, restaurantId)
      })
    )

    addResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Erro ao adicionar item ${req.carts[index].productId} ao carrinho:`,
          result.reason
        )
      }
    })

    await Promise.all(
      req.cartToExclude.map(async (cartToDelete) => {
        await deleteItens(cartToDelete, restaurantId)
      })
    )
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listCart = async (
  req: ICartList
): Promise<ICartResponse[] | null> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const result = await listByUser({ restaurantId: decoded.id })
    if (result == null) return null
    return result
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listCartComplete = async (
  req: ICartList
): Promise<ICartResponse[] | null> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const result = await listByUser({ restaurantId: decoded.id })
    if (result == null) return null
    const myHeaders = new Headers()
    myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
    myHeaders.append('external-id', 'F0')
    myHeaders.append('username', 'contato@conectarhortifruti.com.br')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append(
      'system-user-pass',
      'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo='
    )
    myHeaders.append(
      'Authorization',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys'
    )

    const raw = JSON.stringify({
      ids: result?.map((item) => item.productId)
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    }

    const res = await fetch(
      'https://gateway.conectarhortifruti.com.br/api/v1/system/listFavoriteProductToApp',
      requestOptions
    )
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
    const decoded = decode(req.token) as { id: string }
    await deleteByUserId(decoded.id)
  } catch (err: any) {
    if (err.cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
