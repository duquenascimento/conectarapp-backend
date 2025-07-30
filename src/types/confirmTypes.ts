export interface agendamentoPedido {
  token: string
  selectedRestaurant: {
    addressInfos: Array<{
      phoneNumber?: string
    }>
  }
  message: string // Mensagem a ser enviada
  sendDate: string // Data no formato YYYY-MM-DD
  sendTime: string // Horário no formato HH:mm
}

export interface Supplier {
  name: string
  externalId: string
  missingItens: number
  minimumOrder: number
  hour: string
  discount: Discount
}

export interface Discount {
  orderValue: number
  discount: number
  orderWithoutTax: number
  orderWithTax: number
  tax: number
  missingItens: number
  orderValueFinish: number
  product: Product[]
}

export interface Product {
  price: number
  priceWithoutTax: number
  name: string
  sku: string
  quant: number
  orderQuant: number
  obs: string
  priceUnique: number
  priceUniqueWithTaxAndDiscount: number
  image: string[]
  orderUnit: string
  quotationUnit: string
}

export interface confirmOrderRequest {
  token: string
  supplier: Supplier
  restaurant: any
}

export interface confirmOrderPremiumRequest {
  [x: string]: any
  token: string
  selectedRestaurant: any
}

export interface Pedido {
  id_pedido: string
  cliente_com_boleto: string
  data_entrega: string
  horario_minimo: string
  horario_maximo: string
  id_cliente: Cliente[]
  nome: string
  cnpj_fornecedor: string
  detalhamento_pedido: DetalhamentoPedido[]
  total_sem_descontos: string
  total_em_descontos: string
  total_conectar: string
  restaurante: string
  data_vencimento: string
  razao_social: string
  cnpj: string
  data_pedido: string
  numero_linha_digitavel: string
  url_img_pix: string
  id_beneficiario: string
  data_emissao: string
  identificador_calculado: string
  numero_nosso_numero: string
  codigo_carteira: string
  nome_logradouro: string
  numero_cep: string
  nome_bairro: string
  nome_cidade: string
  sigla_UF: string
  codigo_barras: string
  id_distribuidor: string
  nome_cliente: string
}

interface Cliente {
  bairro: string
  cidade: string
  rua: string
  numero_e_complemento: string
  cep: string
  nome: string
  razao_social: string
  cnpj: string
  inscricao_estadual: string
  resp_recebimento: string
  tel_resp_recebimento: string
  informacao_de_entrega: string
}

interface DetalhamentoPedido {
  exibir_para_cliente: string
  qtd_final_cliente: string
  unidade_cotacao: string
  custo_unidade_conectar: string
  preco_final_conectar: string
}

export type PaymentDescriptions = Record<string, string>
