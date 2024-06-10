import { saveFavorite, deleteFavorite, findByProductAndUser, listByUser } from '../repository/favoriteRepository'
import { logRegister } from '../utils/logUtils'
import { v4 as uuidv4 } from 'uuid'
import { decode } from 'jsonwebtoken'

export interface ISaveFavoriteRequest {
  token: string
  productId: string
}

export interface ISaveFavorite {
  id: string
  productId: string
  restaurantId: string
}

export const save = async (req: ISaveFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null) throw Error('missing token', { cause: 'visibleError' })
    const decoded = decode(req.token) as { id: string }
    const request: ISaveFavorite = {
      id: uuidv4(),
      productId: req.productId,
      restaurantId: decoded.id
    }
    const result = await findByProductAndUser(request)
    if (result != null) return null
    await saveFavorite(request)
    return true
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export interface IDeleteFavoriteRequest {
  productId: string
  token: string
}

export interface IDeleteFavorite {
  productId: string
  restaurantId: string
}

export const del = async (req: IDeleteFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null) throw Error('missing token', { cause: 'visibleError' })
    const decoded = decode(req.token) as { id: string }
    const request: IDeleteFavorite = {
      productId: req.productId,
      restaurantId: decoded.id
    }
    const result = await findByProductAndUser(request as ISaveFavorite)
    if (result == null) return null
    await deleteFavorite(result.id)
    return true
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export interface IListFavorite {
  token: string
}

export const list = async (req: IListFavorite): Promise<any> => {
  try {
    if (req.token == null) throw Error('missing token', { cause: 'visibleError' })
    const decoded = decode(req.token) as { id: string }
    const result = await listByUser(decoded.id)
    const myHeaders = new Headers()
    myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
    myHeaders.append('external-id', 'F0')
    myHeaders.append('username', 'contato@conectarhortifruti.com.br')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=')
    myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys')

    const raw = JSON.stringify({
      ids: result?.map(item => item.productId)
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    }

    const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/listFavoriteProductToApp', requestOptions)
    const data = await res.json()
    return data.data
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
