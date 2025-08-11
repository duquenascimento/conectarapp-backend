import { ApiRepository } from '../repository/apiRepository'
import { listByUser } from '../repository/cartRepository'
import { findRestaurantById } from '../repository/restaurantRepository'
import { type MotorCombinacaoRequest, type CombinacaoAPI, type FornecedorPriceList } from '../types/quotationTypes'
import { aplicarPreferencias, cestaProdutos, fornecedoresCotacaoPremium, getSuppliersFromPriceList, solveCombinations } from '../utils/premiumCestaProdutos'
import { decode } from 'jsonwebtoken'
import { suppliersPrices } from './priceService'
import { type ICartResponse, type ICartList } from './cartService'
import { HttpException } from '../errors/httpException'
import axios from 'axios'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')
const apiMotorCotacao = new ApiRepository(process.env.API_MOTOR_COTACAO ?? '')

export interface CotacaoData {
  token: string
  selectedRestaurant: any
  cart: any[]
  prices: any[]
}

export const quotationEngine = async (data: ICartList) => {
  const restaurant = await findRestaurantById(data.selectedRestaurant?.id as string)

  if (!restaurant) {
    throw new HttpException('Restaurante não encontrado', 404)
  }
  const decoded = decode(data.token) as { id: string }

  const cart = await listByUser({ restaurantId: decoded.id })
  if (!cart) {
    throw new HttpException('Carrinho não encontrado', 404)
  }

  console.log('CART >>>>>>>', cart)

  const cestaDeProdutos = await cestaProdutos(cart)
  console.log('\n\nCART CONVERTIDO >>>>>>>', cestaDeProdutos)

  const priceList = await suppliersPrices(data)
  console.log('\n\n\nPRICES >>>>>>>', priceList)

  const fornecedoresList = priceList.data.map((item: any) => item.supplier) as FornecedorPriceList[]
  console.log('\n\n\nFORNECEDORES >>>>>>>', fornecedoresList)

  const fornecedores = await fornecedoresCotacaoPremium(fornecedoresList, cestaDeProdutos)
  console.log('\n\nFORNECEDORES CONVERTIDOS >>>>>>>', fornecedores)

  if (!fornecedores || fornecedores.length === 0) {
    throw new HttpException('Nenhum fornecedor disponível', 404)
  }

  const resultCombinacoes = await apiDbConectar.callApi(`/system/combinacao/${restaurant.id}`, 'GET')
  const combinacoesCliente = resultCombinacoes.data as CombinacaoAPI[]

  if (!combinacoesCliente || combinacoesCliente.length === 0) {
    throw new HttpException('Nenhuma combinação encontrada para o restaurante', 404)
  }

  const combinacao = combinacoesCliente[11]

  const favoriteProducts = combinacao.preferencias.flatMap((preferencia) =>
    preferencia.produtos
      .filter((prod) => prod.produto_sku !== null)
      .map((prod) => ({
        productId: prod.produto_sku,
        supplierId: 'F30',
        unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar'
      }))
  )

  const favoriteCategories = combinacao.preferencias.flatMap((preferencia) =>
    preferencia.produtos
      .filter((prod) => prod.classe !== null)
      .map((prod) => ({
        class: prod.classe,
        supplierId: 'F35',
        unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar'
      }))
  )

  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

  const requisicaoMotor: MotorCombinacaoRequest = {
    suppliers: fornecedores,
    favoriteProducts,
    favoriteCategories,
    products: cestaDeProdutos,
    fee: taxa,
    zeroFee: [],
    maxSupplier: combinacao.dividir_em_maximo
  }

  // return requisicaoMotor

  const result = await axios.post('http://localhost:8001/solve', requisicaoMotor)

  return result.data
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
  // const suppliers = await getSuppliersFromPriceList(data.prices, cart)

  /* if (!suppliers) {
    throw new HttpException('Não há fornecedores disponíveis', 404)
  } */

  const combinations = await solveCombinations(data.prices, cart, restaurant)

  return combinations
}
