import { configure, base, type FieldSet, type Record as AirtableRecord } from 'airtable'

configure({
  apiKey: process.env.AIRTABLE_TOKEN ?? ''
})

interface CreateRegisterAirtable {
  'ID pagamento': string
  'Nome do estabelecimento': string
  CNPJ: string
  'Inscrição estadual': string
  Rua: string
  Número: string
  'Complemento': string
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

export const createRegisterAirtable = async (req: CreateRegisterAirtable): Promise<AirtableRecord<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_REGISTER_ID ?? '').table(process.env.AIRTABLE_TABLE_REGISTER_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}
