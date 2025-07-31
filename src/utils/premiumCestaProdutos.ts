import { ApiRepository } from '../repository/apiRepository'
import { type ICartResponse } from '../service/cartService'
import { type PreferenciaClasse, type PreferenciaProduto, type ResultadoPreferencias, type FornecedorMotor, type FornecedorPriceList, type ProdutoCesta, type CombinacaoAPI } from '../types/quotationTypes'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export async function cestaProdutos(cart: ICartResponse[]): Promise<ProdutoCesta[]> {
  const cesta: ProdutoCesta[] = []

  for (const item of cart) {
    const produto = await apiDbConectar.callApi(`/system/produtos/${item.productId}`, 'GET')

    if (!produto) {
      throw new Error('Erro ao buscar produtos na base de dados')
    }

    cesta.push({
      sku: produto.data.sku,
      quantidade: Number(item.amount),
      classe: produto.data.classe
    })
  }

  return cesta
}

export async function fornecedoresCotacaoPremium(fornecedores: FornecedorPriceList[], produtosCesta: ProdutoCesta[]): Promise<FornecedorMotor[] | null> {
  if (fornecedores.length === 0) {
    return null
  }

  const fornecedoresCotacao: FornecedorMotor[] = []
  for (const item of fornecedores) {
    if (item.missingItens < produtosCesta.length) {
      continue
    }

    const fornecedor = await apiDbConectar.callApi(`/system/fornecedores/${item.externalId}`, 'GET')
    if (!fornecedor) {
      throw new Error('Falha ao buscar fornecedores')
    }
    const produtosComPrecoFornecedor: ProdutoCesta[] = produtosCesta.map((prodCesta) => {
      const produto = item.discount.product.find((p) => p.sku === prodCesta.sku)

      return {
        ...prodCesta,
        valorPorUnid: produto?.priceUnique ?? 0
      }
    })

    fornecedoresCotacao.push({
      id: fornecedor.data.id,
      produtos: produtosComPrecoFornecedor,
      descontos: { 0: 0 }, // faixa de descontos por preço do fornecedor, se houver. ex.: 100: 3,  // 3% se pedido ≥ 100
      pedidoMinimo: item.minimumOrder
    })
  }

  return fornecedoresCotacao
}

// As preferencias, por enquanto, estão sendo aplicadas como 'fixar'
export function aplicarPreferencias(cesta: ProdutoCesta[], fornecedores: FornecedorMotor[], preferencias: CombinacaoAPI['preferencias']): ResultadoPreferencias {
  const preferenciasProduto: PreferenciaProduto[] = []
  const preferenciasClasse: PreferenciaClasse[] = []
  const produtosIndisponiveis: ProdutoCesta[] = []

  const cestaAtualizada = [...cesta]

  const hashClasses = new Map<string, Set<string>>()
  const hashSku = new Map<string, { sku: string; fornecedor_id: string }>()

  for (const fornecedor of fornecedores) {
    for (const produto of fornecedor.produtos) {
      const classe = produto.classe
      const chave = `${produto.sku}-${fornecedor.id}`

      if (!hashClasses.has(classe)) {
        hashClasses.set(classe, new Set())
      }
      hashClasses.get(classe)?.add(fornecedor.id)

      if (!hashSku.has(chave)) {
        hashSku.set(chave, { sku: produto.sku, fornecedor_id: fornecedor.id })
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
            sku: produto_sku,
            fornecedor: fornecedor_id
          })
        }
      } else if (classe) {
        const fornecedoresDaClasse = hashClasses.get(classe)
        if (fornecedoresDaClasse?.has(fornecedor_id)) {
          preferenciasClasse.push({
            classe,
            fornecedores: [fornecedor_id]
          })
        }
      }
    }
  }

  return {
    preferenciasProduto,
    preferenciasClasse,
    produtosIndisponiveis,
    cestaAtualizada
  }
}
