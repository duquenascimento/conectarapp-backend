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
