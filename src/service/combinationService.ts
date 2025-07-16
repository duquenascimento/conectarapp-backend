import { ApiRepository } from '../repository/apiRepository'
import { type CombinacaoInput } from '../types/combinationType'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export const getCombination = async (restaurant_id: string): Promise<any> => {
  const combinationRoute = await apiDbConectar.callApi(`/system/combinacao/${restaurant_id}`, 'GET')
  return combinationRoute.data
}

export const postCombination = async (body: CombinacaoInput) => {
  return await apiDbConectar.callApi('/system/combinacao', 'POST', JSON.stringify(body))
}
