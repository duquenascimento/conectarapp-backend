import { findRestaurantById } from '../repository/restaurantRepository'
import { cestaProdutos, fornecedoresCotacaoPremium, solveCombinations } from '../utils/premiumCestaProdutos'
import { type ICartResponse } from './cartService'
import { HttpException } from '../errors/httpException'
export interface CotacaoData {
  token: string
  selectedRestaurant: any
  cart: any[]
  prices: any[]
}

export const newQuotationEngine = async (data: CotacaoData) => {
  const restaurant = await findRestaurantById(data.selectedRestaurant?.id as string)

  if (!restaurant) {
    throw new HttpException('Restaurante não encontrado', 404)
  }

  const iCart = data.cart.map(([_, dados]) => ({
    ...dados,
    amount: Number(dados.amount)
  })) as ICartResponse[]

  const cart = await cestaProdutos(iCart)

  const combinations = await solveCombinations(data.prices, cart, restaurant)

  return combinations
}
