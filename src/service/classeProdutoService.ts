import axios from 'axios'

export const listClassesProduto = async (): Promise<any> => {
  try {
    const dbConectarApiUrl = process.env.DBCONECTAR_API_URL ?? 'http://localhost:3333'

    const response = await axios.get(`${dbConectarApiUrl}/system/classes-produto`)

    if (response.data?.success) {
      return response.data.data
    } else {
      throw new Error('Falha ao buscar dados da API de classes de produto.')
    }
  } catch (error) {
    console.error('Erro ao chamar a API de classes de produto:', error)
    throw new Error(process.env.INTERNAL_ERROR_MSG ?? 'Erro interno do servidor')
  }
}
