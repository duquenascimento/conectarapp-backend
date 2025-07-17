import { ApiRepository } from '../repository/apiRepository'
import { requisicaoSchema } from '../validators/quotationValidator'
import { listCart } from './cartService'

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '')

interface ProdutoCesta {
  sku: string
  quantidade: number
  classe: string
  valorPorUnid?: number
}

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

export const postCombinacaoCotacao = async (combinacoes: CombinacaoAPI[], cesta: ProdutoCesta[], taxa: number) => {
  const resultados = []
  const preferenciasProduto = []
  const classeMap = new Map<string, Set<string>>()

  for (const combinacao of combinacoes) {
    const fornecedoresMap: Record<string, { id: string, produtos: ProdutoCesta[] }> = {}
    const apiMotorCotacao = new ApiRepository(process.env.API_MOTOR_COTACAO ?? '')

    for (const preferencia of combinacao.preferencias) {
      for (const produto of preferencia.produtos) {
        const itemCesta = cesta.find((p) => p.sku === produto.produto_sku)
        if (!itemCesta) continue

        const fornecedorId = produto.fornecedor_id

        const classe = produto.classe
        if (!classeMap.has(classe)) {
          classeMap.set(classe, new Set())
        }
        classeMap.get(classe)?.add(fornecedorId)

        if (!fornecedoresMap[fornecedorId]) {
          fornecedoresMap[fornecedorId] = {
            id: fornecedorId,
            produtos: []
          }
        }

        preferenciasProduto.push({ sku: produto.produto_sku, fornecedor: produto.fornecedor_id })

        fornecedoresMap[fornecedorId].produtos.push({
          sku: produto.produto_sku,
          classe: produto.classe,
          quantidade: itemCesta.quantidade,
          valorPorUnid: itemCesta.valorPorUnid
        })
      }
    }

    const skusAdicionados = new Set<string>()
    for (const f of Object.values(fornecedoresMap)) {
      for (const p of f.produtos) {
        skusAdicionados.add(String(p.sku))
      }
    }

    // Adiciona os produtos que estão na cesta mas não foram adicionados
    for (const item of cesta) {
      if (!skusAdicionados.has(String(item.sku))) {
        const fallbackFornecedor = Object.keys(fornecedoresMap)[0]
        if (!fallbackFornecedor) {
          throw new Error('Nenhum fornecedor disponível para adicionar itens restantes da cesta.')
        }

        fornecedoresMap[fallbackFornecedor].produtos.push({
          sku: item.sku,
          classe: item.classe,
          quantidade: item.quantidade,
          valorPorUnid: item.valorPorUnid ?? 0
        })

        skusAdicionados.add(String(item.sku))
      }
    }

    const fornecedores = Object.values(fornecedoresMap).map((f) => ({
      ...f,
      descontos: { 0: 0 },
      pedidoMinimo: 40.0
    }))

    const preferenciasClasse = Array.from(classeMap.entries()).map(([classe, fornecedoresSet]) => ({
      classe,
      fornecedores: Array.from(fornecedoresSet)
    }))

    const payloadCotacao = {
      fornecedores,
      fornecedoresBloqueados: combinacao.fornecedores_bloqueados,
      preferenciasProduto,
      preferenciasClasse,
      preferenciasHard: combinacao.preferencias_hard,
      cesta,
      taxa
    }

    console.log('>>>>>>', JSON.stringify(payloadCotacao))
    const { error } = requisicaoSchema.validate(payloadCotacao)
    if (error) {
      throw new Error(`Body inválido para motor de cotação: ${error.details[0].message}`)
    }
    const result = await apiMotorCotacao.callApi('/bestPrice', 'POST', JSON.stringify(payloadCotacao))

    resultados.push(result)
  }

  return resultados
}

export const cestaProdutos = async (restaurantId: string) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjpbInJlZ2lzdGVyZWQiXSwiaWQiOiI1NjY4NTYzYy01ZTEzLTRhODMtYTI2Yi1iYmI0NGUwNzE3ZmIiLCJlbWFpbCI6InRlc3RlMzVAdGVzdGUuY29tIiwicmVzdGF1cmFudCI6WyI5N2IzYmFkMi04ZTgyLTRiYzEtODMxMC0wZGY0Y2Y0MjNjNTAiXSwiYWN0aXZlIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI1LTA1LTI3VDAwOjAwOjAwLjAwMFoiLCJpYXQiOjE3NTI2MDgzNjB9.hx34Mq5N79TqT4XrCcP9K8Fl_sRpfKLoFCBiiinR_Gg'

  const cart = await listCart({ token, selectedRestaurant: restaurantId })
  const cesta = []
  if (cart) {
    for (const item of cart) {
      cesta.push(await apiDbConectar.callApi(`/system/produtos/${item.productId}`, 'GET'))
    }
  }
  return { cesta, cart }
}
