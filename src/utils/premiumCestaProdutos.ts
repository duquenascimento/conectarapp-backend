import axios from 'axios'
import { ApiRepository } from '../repository/apiRepository'
import { type ICartResponse } from '../service/cartService'
import {
  type FornecedorMotor,
  type ProdutoCesta,
  type CombinacaoAPI,
  type CombinationResponse,
  type MotorCombinacaoRequest,
  type MotorCombinacaoResponse,
  type MotorCombinacaoWithSupplierNames,
  type PreferenciaClasse,
  type PreferenciaProduto
} from '../types/quotationTypes'
import { HttpException } from '../errors/httpException'
import { preferencesResolver } from './premium-preferences.utils'
import {
  getSuppliersFromPriceList,
  addSupplierNames
} from './premium-suppliers.utils'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export async function cestaProdutos(
  cart: ICartResponse[]
): Promise<ProdutoCesta[]> {
  const cesta: ProdutoCesta[] = []

  for (const item of cart) {
    const produto = await apiDbConectar.callApi(
      `/system/produtos/${item.productId}`,
      'GET'
    )

    if (!produto) {
      throw new Error('Erro ao buscar produtos na base de dados')
    }

    cesta.push({
      id: produto.data.sku,
      quantity: Number(item.amount),
      class: produto.data.classe
    })
  }

  return cesta
}

export async function solveCombinations(
  prices: any[],
  products: ProdutoCesta[],
  restaurant: any
): Promise<CombinationResponse[] | undefined> {
  const combinationsResult = await apiDbConectar.callApi(
    `/system/combinacao/${restaurant.id}`,
    'GET'
  )
  const combinations = combinationsResult.data as CombinacaoAPI[]

  const reqSuppliers = await getSuppliersFromPriceList(prices, products)
  if (!reqSuppliers) {
    throw new HttpException('Não há fornecedores disponíveis', 404)
  }

  const solvedCombinations: CombinationResponse[] = []
  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

  for (const combination of combinations) {
    const favoriteCategories: PreferenciaClasse[] = []
    const favoriteProducts: PreferenciaProduto[] = []
    let suppliers: FornecedorMotor[] = reqSuppliers.filter(
      (sup) => !combination.fornecedores_bloqueados.includes(sup.id)
    )

    if (combination.preferencia_fornecedor_tipo === 'especifico') {
      const { preferenceCategories, preferenceProducts } =
        preferencesResolver(combination)
      favoriteCategories.push(...preferenceCategories)
      favoriteProducts.push(...preferenceProducts)
      suppliers = suppliers.filter((sup) =>
        combination.fornecedores_especificos.includes(sup.id)
      )
    }

    const reqMotor: MotorCombinacaoRequest = {
      suppliers,
      favoriteCategories,
      favoriteProducts,
      products,
      fee: taxa,
      zeroFee: [],
      maxSupplier: combination.dividir_em_maximo
    }
    const rawResultadoCotacao = await combinationSolverEngine(reqMotor)
    const resultadoCotacao = addSupplierNames(rawResultadoCotacao, prices)

    solvedCombinations.push({
      id: combination.id,
      nome: combination.nome,
      resultadoCotacao
    })
  }

  return solvedCombinations
}

async function combinationSolverEngine(
  req: MotorCombinacaoRequest
): Promise<MotorCombinacaoResponse> {
  const result = await axios.post(`${process.env.API_MOTOR_COTACAO}/solve`, req)
  return result.data
}
