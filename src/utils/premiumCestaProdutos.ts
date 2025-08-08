import axios from 'axios'
import { ApiRepository } from '../repository/apiRepository'
import { type ICartResponse } from '../service/cartService'
import { type PreferenciaClasse, type PreferenciaProduto, type ResultadoPreferencias, type FornecedorMotor, type FornecedorPriceList, type ProdutoCesta, type CombinacaoAPI, type CombinationResponse, type MotorCombinacaoRequest, type MotorCombinacaoResponse } from '../types/quotationTypes'

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

export async function getSuppliersFromPriceList(prices: any, cart: ProdutoCesta[]): Promise<FornecedorMotor[] | null> {
  const supplierList = prices.data.map((item: any) => item.supplier) as FornecedorPriceList[]
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
        productId: produto?.sku,
        price: produto?.priceUnique
      }
    })

    fornecedoresCotacao.push({
      id: item.externalId,
      products: produtosComPrecoFornecedor,
      discounts: [], // faixa de descontos por preço do fornecedor, se houver. ex.: 100: 3,  // 3% se pedido ≥ 100
      minValue: item.minimumOrder
    })
  }

  return fornecedoresCotacao
}

export async function solveCombinations(suppliers: FornecedorMotor[], products: ProdutoCesta[], restaurant: any): Promise<CombinationResponse[]> {
  const combinationsResult = await apiDbConectar.callApi(`/system/combinacao/${restaurant.id}`, 'GET')
  const combinations = combinationsResult.data as CombinacaoAPI[]

  const solvedCombinations: CombinationResponse[] = []
  const tax = restaurant.tax.d
  const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

  for (const combination of combinations) {
    const { favoriteCategories, favoriteProducts } = preferencesResolver(combination)
    const reqMotor: MotorCombinacaoRequest = {
      suppliers,
      products,
      favoriteCategories,
      favoriteProducts,
      fee: taxa,
      zeroFee: [],
      maxSupplier: combination.dividir_em_maximo
    }

    const resultadoCotacao = await combinationSolverEngine(reqMotor)

    solvedCombinations.push({ id: combination.id, nome: combination.nome, resultadoCotacao })
  }

  return solvedCombinations
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
  const result = await axios.post('http://localhost:8001/solve', req)

  return result.data
}

// As preferencias, por enquanto, estão sendo aplicadas como 'fixar'
export function aplicarPreferencias(cesta: ProdutoCesta[], fornecedores: FornecedorMotor[], preferencias: CombinacaoAPI['preferencias']): ResultadoPreferencias {
  const preferenciasProduto: PreferenciaProduto[] = []
  const preferenciasClasse: PreferenciaClasse[] = []
  const produtosIndisponiveis: ProdutoCesta[] = []

  const cestaAtualizada = [...cesta]

  const hashClasses = new Map<string, Set<string>>()
  const hashSku = new Map<string, { sku: string; fornecedor_id: string }>()

  /*   for (const fornecedor of fornecedores) {
    for (const produto of fornecedor.products) {
      const classe = produto.class
      const chave = `${produto.id}-${fornecedor.id}`

      if (!hashClasses.has(classe)) {
        hashClasses.set(classe, new Set())
      }
      hashClasses.get(classe)?.add(fornecedor.id)

      if (!hashSku.has(chave)) {
        hashSku.set(chave, { sku: produto.id, fornecedor_id: fornecedor.id })
      }
    }
  }

  for (const preferencia of preferencias) {
    for (const produto of preferencia.produtos) {
      const { produto_sku, classe, fornecedor_id } = produto

      if (produto_sku) {
        const chave = `${produto_sku}-${fornecedor_id}`
        if (hashSku.has(chave)) {
          preferenciasProduto.push({
            productId: produto_sku,
            supplierId: fornecedor_id,
            unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar'
          })
        }
      } else if (classe) {
        const fornecedoresDaClasse = hashClasses.get(classe)
        if (fornecedoresDaClasse?.has(fornecedor_id)) {
          preferenciasClasse.push({
            class: classe,
            supplierId: fornecedor_id,
            unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar'
          })
        }
      }
    }
  } */

  return {
    preferenciasProduto,
    preferenciasClasse,
    produtosIndisponiveis,
    cestaAtualizada
  }
}
