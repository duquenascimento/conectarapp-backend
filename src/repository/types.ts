import { type FieldSet, type Record as AirtableRecord, type Records } from 'airtable'

export interface CreateOrderAirtable {
  ID_Pedido: string
  'Data Pedido': string
  'Data Entrega': string
  Horário: string
  'Forma de pagamento': string
  'Ponto de referência': string
  'Código operador': string
  'Total Fornecedor': number
  'Total Conéctar': number
  'Status Pedido': 'Confirmado' | 'Teste' | 'Cancelado' | 'Recusado'
  'ID Distribuidor': string[]
  'Presentes na cotação': string[]
  'Recibo original': Array<{ url: string }>
  ID_Cliente: string[]
  'Pedido Bubble': boolean
  Identificador: string
}

export interface CreateOrderTextAirtable {
  'ID Cliente': string
  'Data Pedido': string
  'Texto Pedido': string
  App: boolean
  'Pedido Premium'?: boolean
}

export interface CreateOrderSupplierAppAirtable {
  'Data Entrega': string
  'ID Cliente': string[]
  'ID fornecedor': string[]
  Status: 'Confirmado' | 'Cancelado' | 'Recusado'
  Recibo: Array<{ url: string }>
  'Exibir pedido': true
  'Tipo de pedido': string
  'Valor auto': number
  'Chave pix'?: string
  'Código operador': string[]
}

export interface CreateDetailingAirtable {
  ID_Pedido: string[]
  'ID Produto': string[]
  'Qtd Pedido': number
  'Qtd Final Distribuidor': number
  'Qtd Final Cliente': number
  'Custo / Unidade Fornecedor': number
  'Custo / Unidade Conéctar': number
  'Preço Final Distribuidor': number
  'Preço Final Conéctar': number
  'Status Detalhamento Pedido': 'Confirmado' | 'Teste' | 'Produto não disponível'
  OBS: string
  Aux_OBS: string
  'Custo Estimado': number
  'Custo / Unid Fornecedor BD': number
  'Custo / Unidade Conéctar BD': number
  'Taxa Cliente': number
  'Qtd Estimada': number
}

export interface ProductAirtable {
  productId: string
  airtableId: string
}

export interface CreateRegisterAirtable {
  'ID pagamento': string
  'Nome do estabelecimento': string
  CNPJ: string
  'Inscrição estadual': string
  Rua: string
  Número: string
  Complemento: string
  'CEP de entrega': string
  Bairro: string
  Cidade: string
  'Portas fechadas': boolean
  'Razão social': string
  Premium: boolean
  'Ticket médio cadastrado': string
  'Telefone para contato com DDD': string
  'Até que horas o seu estabelecimento pode receber o pedido?': string
  'A partir de que horas seu estabelecimento está disponível para recebimento de hortifrúti?': string
  'PJ ou PF': string
  'Termos e condições': string
  'E-mail para comunicados': string
  'Código Promotor': string
  'Quantas vezes em média na semana você faz pedidos?': string
  'Cadastrado por': string
}

export interface UpdateAddressRegisterAirtable {
  ID_Cliente: string
  Número: string
  Rua: string
  'Resp. recebimento': string
  'Tel resp. recebimento': string
  Complemento: string
  CEP: string
  'Informações de entrega': string
}

export type AirtableResponse = AirtableRecord<FieldSet> | Records<FieldSet> | undefined
