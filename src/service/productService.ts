import { logRegister } from '../utils/logUtils'
import { ApiRepository } from '../repository/apiRepository'

const apiRepository = new ApiRepository(process.env.URL_API_ANTIGA ?? '')

export const listProduct = async (): Promise<any> => {
  try {
    const json = await apiRepository.callApi('/listProductToApp', 'GET')

    // Filtrar os itens com "active": true
    const filteredData = json.data.filter((item: any) => item.active === true)

    return {
      success: json.success,
      statusCode: json.statusCode,
      data: filteredData
    }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const listAllProducts = async (): Promise<any> => {
  try {
    const json = await apiRepository.callApi('/listProductToApp', 'GET')

    return {
      success: json.success,
      statusCode: json.statusCode,
      data: json.data
    }
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
