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

export function aplicarPreferencias(cesta: ProdutoCesta[], fornecedores: FornecedorPriceList[], preferencias: CombinacaoAPI['preferencias']): ResultadoPreferencias {
  const preferenciasProduto: PreferenciaProduto[] = []
  const preferenciasClasse: PreferenciaClasse[] = []
  const produtosIndisponiveis: ProdutoCesta[] = []
  let cestaAtualizada = [...cesta]

  const getFornecedoresComProduto = (sku: string): string[] => {
    return fornecedores.filter((f) => f.discount.product.some((p) => p.sku === sku)).map((f) => f.externalId)
  }

  const getFornecedoresComClasse = (classe: string): string[] => {
    return fornecedores
      .filter((f) =>
        f.discount.product.some((p) => {
          const itemCesta = cesta.find((c) => c.sku === p.sku)
          return itemCesta?.classe === classe
        })
      )
      .map((f) => f.externalId)
  }

  for (const preferencia of preferencias.sort((a, b) => a.ordem - b.ordem)) {
    for (const item of preferencia.produtos) {
      const { produto_sku, classe, fornecedor_id } = item
      const tipo = preferencia.tipo
      const acao = preferencia.acao_na_falha

      if (acao === 'ignorar') continue

      // Preferência por produto específico
      if (produto_sku) {
        const fornecedoresDoProduto = getFornecedoresComProduto(produto_sku)

        if (tipo === 'fixar') {
          if (fornecedoresDoProduto.includes(fornecedor_id)) {
            preferenciasProduto.push({ sku: produto_sku, fornecedor: fornecedor_id })
          } else if (acao === 'indisponível') {
            cestaAtualizada = cestaAtualizada.filter((p) => p.sku !== produto_sku)
            const produtoOriginal = cesta.find((p) => p.sku === produto_sku)
            if (produtoOriginal) produtosIndisponiveis.push(produtoOriginal)
          }
        }

        if (tipo === 'remover') {
          if (fornecedoresDoProduto.length === 1 && fornecedoresDoProduto[0] === fornecedor_id && acao === 'indisponível') {
            cestaAtualizada = cestaAtualizada.filter((p) => p.sku !== produto_sku)
            const produtoOriginal = cesta.find((p) => p.sku === produto_sku)
            if (produtoOriginal) produtosIndisponiveis.push(produtoOriginal)
          }
        }
      }

      if (classe) {
        const fornecedoresDaClasse = getFornecedoresComClasse(classe)

        if (tipo === 'fixar') {
          if (fornecedoresDaClasse.includes(fornecedor_id)) {
            let classePreferida = preferenciasClasse.find((p) => p.classe === classe)
            if (!classePreferida) {
              classePreferida = { classe, fornecedores: [] }
              preferenciasClasse.push(classePreferida)
            }
            if (!classePreferida.fornecedores.includes(fornecedor_id)) {
              classePreferida.fornecedores.push(fornecedor_id)
            }
          } else if (acao === 'indisponível') {
            const removidos = cestaAtualizada.filter((p) => p.classe === classe)
            cestaAtualizada = cestaAtualizada.filter((p) => p.classe !== classe)
            produtosIndisponiveis.push(...removidos)
          }
        }

        if (tipo === 'remover') {
          if (fornecedoresDaClasse.length === 1 && fornecedoresDaClasse[0] === fornecedor_id && acao === 'indisponível') {
            const removidos = cestaAtualizada.filter((p) => p.classe === classe)
            cestaAtualizada = cestaAtualizada.filter((p) => p.classe !== classe)
            produtosIndisponiveis.push(...removidos)
          }
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
