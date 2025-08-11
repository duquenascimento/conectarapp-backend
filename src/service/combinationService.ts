import axios from 'axios'
import { ApiRepository } from '../repository/apiRepository'
import { type CombinacaoInput } from '../types/combinationType'
import { HttpException } from '../errors/httpException'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export const getCombination = async (restaurant_id: string): Promise<any> => {
  const combinationRoute = await apiDbConectar.callApi(`/system/combinacao/${restaurant_id}`, 'GET')
  return combinationRoute.data
}

export const postCombination = async (body: CombinacaoInput) => {
  return await apiDbConectar.callApi('/system/combinacao', 'POST', JSON.stringify(body))
}

export const deleteCombination = async (id: string): Promise<any> => {
  try {
    const result = await axios.delete(`${process.env.API_DB_CONECTAR}/system/combinacao/${id}`, {})
    return {
      status: result.status,
      data: result.data
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new HttpException(`${error.response.data.error.message}`, Number(error.response.data.statusCode) ?? 500)
      }
    }
    throw new HttpException('Falha ao deletar combinação: erro desconhecido', 500)
  }
  /*   const response = await apiDbConectar.callApi(`/system/combinacao/${id}`, 'DELETE')
  return response.data */
}
