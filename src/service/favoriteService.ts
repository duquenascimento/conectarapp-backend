import { saveFavorite, updateFavorite, deleteFavorite, findByProductAndUser, listByUser } from '../repository/favoriteRepository'
import { logRegister } from '../utils/logUtils'
import { v4 as uuidv4 } from 'uuid'
import { decode } from 'jsonwebtoken'
import { ApiRepository } from '../repository/apiRepository'

const apiRepository = new ApiRepository(process.env.URL_API_ANTIGA ?? '')

export interface ISaveFavoriteRequest {
  token: string
  productId: string
  restaurantId: string // adicionado id do restaurante a salvar o favorito
  obs?: string
}

export interface ISaveFavorite {
  id: string
  productId: string
  restaurantId: string
  obs?: string
}

export const save = async (req: ISaveFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null) {
      throw Error('missing token', { cause: 'visibleError' })
    }
    const decoded = decode(req.token) as { id: string }
    const request: ISaveFavorite = {
      id: uuidv4(),
      productId: req.productId,
      restaurantId: req.restaurantId,
      obs: req.obs
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
  restaurantId: string
}

export interface IDeleteFavorite {
  productId: string
  restaurantId: string
}

export const del = async (req: IDeleteFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null) {
      throw Error('missing token', { cause: 'visibleError' })
    }
    const decoded = decode(req.token) as { id: string }
    const request: IDeleteFavorite = {
      productId: req.productId,
      restaurantId: req.restaurantId
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
  restaurantId: string
  obs: string
}

export const list = async (req: IListFavorite): Promise<any> => {
  try {
    if (req.token == null) {
      throw Error('missing token', { cause: 'visibleError' })
    }
    const decoded = decode(req.token) as { id: string }

    // Obter a lista de favoritos do seu banco de dados
    const result = await listByUser(req.restaurantId)

    // Criar um mapa de productId para obs para fácil acesso
    const obsMap = new Map<string, string>()
    result?.forEach((item) => {
      if (item.productId && item.obs) {
        obsMap.set(item.productId, item.obs)
      }
    })

    const raw = JSON.stringify({
      ids: result?.map((item) => item.productId)
    })

    const response = await apiRepository.callApi('/listFavoriteProductToApp', 'POST', raw)

    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error('Resposta da API inválida')
    }

    // Filtrar os itens com active: true e adicionar as obs
    const filteredData = response.data
      .filter((item: any) => item.active === true)
      .map((item: any) => ({
        ...item,
        obs: obsMap.get(String(item.id)) ?? '' // Adiciona a obs do seu banco ou null se não existir
      }))

    return filteredData
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export interface IUpdateFavoriteRequest {
  token: string
  productId: string
  restaurantId: string
  obs: string
}

export interface IUpdateFavorite {
  id: string
  obs: string
}

export const update = async (req: IUpdateFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null) {
      throw Error('missing token', { cause: 'visibleError' })
    }

    const decoded = decode(req.token) as { id: string }

    const request: ISaveFavorite = {
      id: uuidv4(), // você não usará esse id diretamente, mas é necessário para a função
      productId: req.productId,
      restaurantId: req.restaurantId
    }
    const result = await findByProductAndUser(request)
    if (result === null) return null

    const updateData: IUpdateFavorite = {
      id: result.id,
      obs: req.obs
    }

    await updateFavorite(updateData)
    return true
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
