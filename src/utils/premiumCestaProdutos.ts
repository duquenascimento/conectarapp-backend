import axios from 'axios'
import { ApiRepository } from '../repository/apiRepository'
import { type ICartResponse } from '../service/cartService'
import { type FornecedorMotor, type FornecedorPriceList, type ProdutoCesta, type CombinacaoAPI, type CombinationResponse, type MotorCombinacaoRequest, type MotorCombinacaoResponse, type MotorCombinacaoWithSupplierNames } from '../types/quotationTypes'
import { HttpException } from '../errors/httpException'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export async function cestaProdutos(cart: ICartResponse[]): Promise<ProdutoCesta[]> {
  const cesta: ProdutoCesta[] = []

  for (const item of cart) {
    const produto = await apiDbConectar.callApi(`/system/produtos/${item.productId}`, 'GET')

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

export async function getSuppliersFromPriceList(prices: any[], cart: ProdutoCesta[]): Promise<FornecedorMotor[] | null> {
  const supplierList = prices.map((item: any) => item.supplier) as FornecedorPriceList[]
  const result = await fornecedoresCotacaoPremium(supplierList, cart)

  return result
}

export async function fornecedoresCotacaoPremium(fornecedores: FornecedorPriceList[], produtosCesta: ProdutoCesta[]): Promise<FornecedorMotor[] | null> {
  if (fornecedores.length === 0) {
    return null
  }

  const fornecedoresCotacao: FornecedorMotor[] = []
  for (const item of fornecedores) {
    const produtosComPrecoFornecedor = produtosCesta.map((prodCesta) => {
      const produto = item.discount.product.find((p) => p.sku === prodCesta.id)
      return {
        price: produto?.priceUnique,
        productId: produto?.sku
      }
    })

    fornecedoresCotacao.push({
      id: item.externalId,
      products: produtosComPrecoFornecedor,
      discounts: [],
      minValue: item.minimumOrder
    })
  }

  return fornecedoresCotacao
}

export async function solveCombinations(prices: any[], products: ProdutoCesta[], restaurant: any): Promise<CombinationResponse[]> {
  const combinationsResult = await apiDbConectar.callApi(`/system/combinacao/${restaurant.id}`, 'GET')
  const combinations = combinationsResult.data as CombinacaoAPI[]

  const reqSuppliers = await getSuppliersFromPriceList(prices, products)
  if (!reqSuppliers) {
    throw new HttpException('Não há fornecedores disponíveis', 404)
  }

  let suppliers: FornecedorMotor[] = reqSuppliers
  if (reqSuppliers.length >= 5) {
    suppliers = reqSuppliers.slice(0, 5)
  }

  const solvedCombinations = [] // : CombinationResponse[] = []
  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

  for (const combination of combinations) {
    const { favoriteCategories, favoriteProducts } = preferencesResolver(combination)
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

    solvedCombinations.push({ id: combination.id, nome: combination.nome, resultadoCotacao })
  }

  return solvedCombinations
}

function addSupplierNames(motorResponse: MotorCombinacaoResponse, supplierList: any[]): MotorCombinacaoWithSupplierNames {
  return {
    ...motorResponse,
    supplier: motorResponse.supplier.map((sup) => ({
      ...sup,
      name: supplierList.find((s) => s.supplier.externalId === sup.id)?.supplier.name ?? 'Nome não encontrado'
    }))
  }
}

function preferencesResolver(combinacao: CombinacaoAPI) {
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

  return { favoriteCategories, favoriteProducts }
}

async function combinationSolverEngine(req: MotorCombinacaoRequest): Promise<MotorCombinacaoResponse> {
  const result = await axios.post(`${process.env.API_MOTOR_COTACAO}/solve`, req)
  return result.data
}
