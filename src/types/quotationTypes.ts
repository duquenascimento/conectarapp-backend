export interface ProdutoCesta {
  sku: string
  quantidade: number
  classe: string
  valorPorUnid?: number
}

export interface FornecedorMotor {
  id: string
  produtos: ProdutoCesta[]
  descontos: any
  pedidoMinimo: number
}

export interface FornecedorPriceList {
  name: string
  externalId: string
  missingItens: number
  minimumOrder: number
  star: string
  hour: string
  discount: DiscountPriceList
}

export interface DiscountPriceList {
  orderValue: number
  discount: number
  orderWithoutTax: number
  orderWithTax: number
  tax: number
  missingItens: number
  orderValueFinish: number
  product: ProductPriceList[]
}

export interface ProductPriceList {
  price: number
  priceWithoutTax: number
  name: string
  sku: string
  image: string[]
  quant: number
  orderQuant: number
  quotationUnit: string
  obs: string
  priceUnique: number
  orderUnit: string
  priceUniqueWithTaxAndDiscount: number
}

export interface PreferenciaProduto {
  sku: string
  fornecedor: string
}

export interface PreferenciaClasse {
  classe: string
  fornecedores: string[]
}

export interface ResultadoPreferencias {
  preferenciasProduto: PreferenciaProduto[]
  preferenciasClasse: PreferenciaClasse[]
  produtosIndisponiveis: ProdutoCesta[]
  cestaAtualizada: ProdutoCesta[]
}

export interface CombinacaoAPI {
  nome: string
  bloquear_fornecedores: boolean
  dividir_em_maximo: number
  preferencia_fornecedor_tipo: string
  definir_preferencia_produto: boolean
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
