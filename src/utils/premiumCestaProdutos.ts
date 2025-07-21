import { ApiRepository } from '../repository/apiRepository'
import { type ICartResponse } from '../service/cartService'
import { type FornecedorMotor, type FornecedorPriceList, type ProdutoCesta } from '../types/quotationTypes'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

export async function cestaProdutos(cart: ICartResponse[]): Promise<ProdutoCesta[] | null> {
  if (cart.length === 0) {
    return null
  }
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
    const fornecedor = await apiDbConectar.callApi(`/system/fornecedores/${item.externalId}`, 'GET')
    if (!fornecedor) {
      throw new Error('Falha ao buscar fornecedores')
    }
    const produtosComPrecoFornecedor: ProdutoCesta[] = produtosCesta.map((prodCesta) => {
      const produto = item.discount.product.find((p) => p.sku === prodCesta.sku)

      return {
        ...prodCesta,
        valorPorUnid: produto?.price ?? 0
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

export const mockRequisicaoMotor = {
  fornecedores: [
    {
      id: '3dbc8d4c-cada-4225-b0b2-aa713f4be14c',
      produtos: [
        {
          valorPorUnid: 5,
          sku: '568',
          quantidade: 10,
          classe: 'FRUTAS'
        }
      ],
      descontos: {
        0: 0
      },
      pedidoMinimo: 40.0
    }
  ],
  fornecedoresBloqueados: [],
  preferenciasProduto: [],
  preferenciasClasse: [],
  preferenciasHard: true,
  cesta: [
    {
      sku: '568',
      quantidade: 10,
      classe: 'FRUTAS'
    }
  ],
  taxa: 0.05
}
