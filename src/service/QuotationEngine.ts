import { ApiRepository } from '../repository/apiRepository'
import { listByUser } from '../repository/cartRepository'
import { findRestaurantById } from '../repository/restaurantRepository'
import { FornecedorMotor, type FornecedorPriceList, type ProdutoCesta } from '../types/quotationTypes'
import { cestaProdutos, fornecedoresCotacaoPremium, mockRequisicaoMotor } from '../utils/premiumCestaProdutos'
import { requisicaoSchema } from '../validators/quotationValidator'
import { decode } from 'jsonwebtoken'
import { suppliersPrices } from './priceService'
import { type ICartList } from './cartService'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')
const apiMotorCotacao = new ApiRepository(process.env.API_MOTOR_COTACAO ?? '')

export interface CombinacaoAPI {
  fornecedores_bloqueados: string[]
  fornecedores_especificos: string[]
  preferencias_hard: boolean
  preferencias: Array<{
    ordem: number
    tipo: string
    acao_na_falha: string
    produtos: Array<{
      produto_sku: string
      classe: string
      fornecedor_id: string
    }>
  }>
}

export const quotationEngine = async (data: ICartList) => {
  /* const restaurant = await findRestaurantById(data.selectedRestaurant?.id as string)

  if (!restaurant) {
    throw new Error('Restaurante não encontrado')
  }
  const decoded = decode(data.token) as { id: string }

  const resultCombinacoes = await apiDbConectar.callApi(`/system/combinacao/${restaurant.id}`, 'GET')
  const combinacoesCliente = resultCombinacoes.data

  const cart = await listByUser({ restaurantId: decoded.id })
  if (!cart) {
    throw new Error('Carrinho não encontrado')
  }

  const cestaDeProdutos = await cestaProdutos(cart)

  const priceList = await suppliersPrices(data)

  const fornecedoresList = priceList.data.map((item: any) => item.supplier) as FornecedorPriceList[]
  const fornecedores = await fornecedoresCotacaoPremium(fornecedoresList, cestaDeProdutos!)

  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

  const preferenciasProduto = []
  const preferenciasClasse = []

  for (const preferencia of combinacoesCliente[0].preferencias) {
    for (const item of preferencia.produtos) {
      if (item.produto_sku) {
        preferenciasProduto.push({
          sku: item.produto_sku,
          fornecedor: item.fornecedor_id
        })
      }

      if (item.classe) {
        let preferenciaExistente: any = preferenciasClasse.find((p) => p.classe === item.classe)
        if (!preferenciaExistente) {
          preferenciaExistente = { classe: item.classe, fornecedores: [] }
          preferenciasClasse.push(preferenciaExistente)
        }

        if (!preferenciaExistente.fornecedores.includes(item.fornecedor_id)) {
          preferenciaExistente.fornecedores.push(item.fornecedor_id)
        }
      }
    }
  }

  const requisicaoMotor = {
    fornecedores,
    fornecedoresBloqueados: combinacoesCliente[0].fornecedores_bloqueados,
    preferenciasProduto,
    preferenciasClasse,
    preferenciasHard: combinacoesCliente[0].preferencias_hard,
    cesta: cestaDeProdutos,
    taxa
  } */

  const requisicaoMotor = mockRequisicaoMotor

  const result = await apiMotorCotacao.callApi('/bestPrice', 'POST', JSON.stringify(requisicaoMotor))

  console.log('\n\n Resultado Cotação: ', result)

  return result
}
