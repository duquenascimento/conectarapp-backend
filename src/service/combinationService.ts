import { ApiRepository } from '../repository/apiRepository'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export const getCombination = async (restaurant_id: string): Promise<any> => {
  const combinationRoute = await apiDbConectar.callApi(`/system/combinacao/${restaurant_id}`, 'GET')
  return combinationRoute.data
}
