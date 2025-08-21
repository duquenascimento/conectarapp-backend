export interface ProdutoCesta {
  id: string
  quantity: number
  class: string
  // valorPorUnid?: number
}

interface ProdutoFornecedor {
  price?: number
  productId?: string
}

interface Discount {
  threshold: number
  rate: number
}

export interface FornecedorMotor {
  id: string
  products: ProdutoFornecedor[]
  discounts: Discount[]
  minValue: number
}

export interface FornecedorPriceList {
  id: string
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
  productId: string
  supplierId: string
  unavailableIfFailed: boolean
}

export interface PreferenciaClasse {
  class: string
  supplierId: string
  unavailableIfFailed: boolean
}

export interface ResultadoPreferencias {
  preferenciasProduto: PreferenciaProduto[]
  preferenciasClasse: PreferenciaClasse[]
  produtosIndisponiveis: ProdutoCesta[]
  cestaAtualizada: ProdutoCesta[]
}

export interface CombinacaoAPI {
  id: string
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

export interface MotorCombinacaoRequest {
  suppliers: FornecedorMotor[]
  favoriteProducts: PreferenciaProduto[]
  favoriteCategories: PreferenciaClasse[]
  products: ProdutoCesta[]
  fee: number
  zeroFee: string[]
  maxSupplier: number
}

interface CartItem {
  productId: string
  amount: number
  value: number
  valueWithoutFee: number
  unitValue: number
  unitValueWithoutFee: number
}

interface SupplierMotor {
  id: string
  orderValue: number
  orderValueWithoutFee: number
  feeUsed: number
  discountUsed: number
  cart: CartItem[]
}
export interface SupplierWithName extends SupplierMotor {
  name: string
}
export interface MotorCombinacaoResponse {
  totalOrderValue: number
  supplier: SupplierMotor[]
  status: string
  terminationCondition: string
}

export interface MotorCombinacaoWithSupplierNames extends Omit<MotorCombinacaoResponse, 'supplier'> {
  supplier: SupplierWithName[]
}

export interface CombinationResponse {
  id: string
  nome: string
  resultadoCotacao: MotorCombinacaoResponse
}
