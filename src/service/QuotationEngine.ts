import { ApiRepository } from '../repository/apiRepository'
import { listByUser } from '../repository/cartRepository'
import { findRestaurantById } from '../repository/restaurantRepository'
import { type CombinacaoAPI, type FornecedorPriceList } from '../types/quotationTypes'
import { aplicarPreferencias, cestaProdutos, fornecedoresCotacaoPremium, mockRequisicaoMotor } from '../utils/premiumCestaProdutos'
import { decode } from 'jsonwebtoken'
import { suppliersPrices } from './priceService'
import { type ICartList } from './cartService'
import { HttpException } from '../errors/httpException'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')
const apiMotorCotacao = new ApiRepository(process.env.API_MOTOR_COTACAO ?? '')

export const quotationEngine = async (data: ICartList) => {
  /* const restaurant = await findRestaurantById(data.selectedRestaurant?.id as string)

  if (!restaurant) {
    throw new HttpException('Restaurante não encontrado', 404)
  }
  const decoded = decode(data.token) as { id: string }

  const cart = await listByUser({ restaurantId: decoded.id })
  if (!cart) {
    throw new HttpException('Carrinho não encontrado', 404)
  }

  const cestaDeProdutos = await cestaProdutos(cart) // monta cesta de produtos

  const priceList = await suppliersPrices(data) // busca os precos dos fornecedores

  const fornecedoresList = priceList.data.map((item: any) => item.supplier) as FornecedorPriceList[]
  const fornecedores = await fornecedoresCotacaoPremium(fornecedoresList, cestaDeProdutos) // monta cesta baseado nos fornecedores e cesta

  if (!fornecedores || fornecedores.length === 0) {
    throw new HttpException('Nenhum fornecedor disponível', 404)
  }

  const resultCombinacoes = await apiDbConectar.callApi(`/system/combinacao/${restaurant.id}`, 'GET')
  const combinacoesCliente = resultCombinacoes.data as CombinacaoAPI[]

  if (!combinacoesCliente || combinacoesCliente.length === 0) {
    throw new HttpException('Nenhuma combinação encontrada para o restaurante', 404)
  }

  const combinacao = combinacoesCliente[0]

  const resultadoPreferencias = aplicarPreferencias(cestaDeProdutos, fornecedoresList, combinacao.preferencias)

  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100 // taxa dos restaurates

  const requisicaoMotor = {
    fornecedores,
    fornecedoresBloqueados: combinacao.fornecedores_bloqueados,
    preferenciasProduto: resultadoPreferencias.preferenciasProduto,
    preferenciasClasse: resultadoPreferencias.preferenciasClasse,
    preferenciasHard: combinacao.preferencias_hard,
    cesta: resultadoPreferencias.cestaAtualizada,
    taxa
  }

  console.log('Requisição Motor:', requisicaoMotor)
  // const requisicaoMotor = mockRequisicaoMotor

  const result = await apiMotorCotacao.callApi('/bestPrice', 'POST', JSON.stringify(requisicaoMotor))

  console.log('\n\n Resultado Cotação: ', result)

  return result
  */

  return mockRequisicaoMotor
}
