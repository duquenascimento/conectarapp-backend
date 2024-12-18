import axios from 'axios'
import dotenv from 'dotenv'
import { validateDocument } from '../utils/validateDocument'

dotenv.config()

const API_TOKEN = process.env.API_TOKEN_CPFCNPJ
const API_URL = process.env.API_URL_CPFCNPJ

export const fetchCNPJData = async (cnpj: string): Promise<any> => {
  if (!validateDocument(cnpj)) {
    throw new Error('CNPJ inválido.')
  }

  try {
    // Pacote D
    const responseD = await axios.get(`${API_URL}/${API_TOKEN}/6/${cnpj}/0`)

    // Pacote H
    const responseH = await axios.get(`${API_URL}/${API_TOKEN}/16/${cnpj}/0`)

    const combinedData = {
      ...responseD.data,
      complementares: responseH.data,
      socios: responseD.data.socios
    }

    return combinedData
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao buscar dados do CNPJ:', error.response?.data)
      throw new Error(`Erro na requisição: ${error.response?.data.message}`)
    } else {
      console.error('Erro inesperado:', error)
      throw new Error('Erro inesperado ao buscar dados do CNPJ.')
    }
  }
}
