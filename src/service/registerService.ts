import { logRegister } from '../utils/logUtils'
import { addClientCount, checkClientCount, findRestaurantByCompanyRegistrationNumber, registerAddress, removeClientCount, updateUserWithRestaurant } from '../repository/restaurantRepository'
import { createRestaurant } from './restaurantService'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'
import { configure, base, type FieldSet, type Record as AirtableRecord } from 'airtable'
import { decode } from 'jsonwebtoken'

export interface CheckCnpj {
  cnpj: string
}

export const checkCnpj = async ({ cnpj }: CheckCnpj): Promise<any> => {
  try {
    const cnpjFormated = cnpj.toLowerCase().trim()
    if (cnpjFormated == null) throw Error('cnpj is missing', { cause: 'visibleError' })
    if (cnpjFormated.length > 14) throw Error('invalid cnpj', { cause: 'visibleError' })
    const cnpjExists = await findRestaurantByCompanyRegistrationNumber(cnpjFormated)
    if (cnpjExists != null) throw Error('already exists', { cause: 'visibleError' })
    return JSON.parse('{"uf":"RJ","cep":"20260141","qsa":[{"pais":null,"nome_socio":"GABRIEL LOPES CARVALHO","codigo_pais":null,"faixa_etaria":"Entre 21 a 30 anos","cnpj_cpf_do_socio":"***545361**","qualificacao_socio":"Sócio-Administrador","codigo_faixa_etaria":3,"data_entrada_sociedade":"2022-12-16","identificador_de_socio":2,"cpf_representante_legal":"***000000**","nome_representante_legal":"","codigo_qualificacao_socio":49,"qualificacao_representante_legal":"Não informada","codigo_qualificacao_representante_legal":0}],"cnpj":"43507341000160","pais":null,"email":null,"porte":"MICRO EMPRESA","bairro":"TIJUCA","numero":"00209","ddd_fax":"","municipio":"RIO DE JANEIRO","logradouro":"HADDOCK LOBO","cnae_fiscal":5611201,"codigo_pais":null,"complemento":"","codigo_porte":1,"razao_social":"M.A.B RESTAURANTE LTDA","nome_fantasia":"M.A.B","capital_social":100000,"ddd_telefone_1":"2134373834","ddd_telefone_2":"","opcao_pelo_mei":false,"descricao_porte":"","codigo_municipio":6001,"cnaes_secundarios":[{"codigo":5620104,"descricao":"Fornecimento de alimentos preparados preponderantemente para consumo domiciliar"}],"natureza_juridica":"Sociedade Empresária Limitada","situacao_especial":"","opcao_pelo_simples":false,"situacao_cadastral":8,"data_opcao_pelo_mei":null,"data_exclusao_do_mei":null,"cnae_fiscal_descricao":"Restaurantes e similares","codigo_municipio_ibge":3304557,"data_inicio_atividade":"2021-09-14","data_situacao_especial":null,"data_opcao_pelo_simples":"2021-09-14","data_situacao_cadastral":"2023-07-05","nome_cidade_no_exterior":"","codigo_natureza_juridica":2062,"data_exclusao_do_simples":"2023-07-05","motivo_situacao_cadastral":1,"ente_federativo_responsavel":"","identificador_matriz_filial":1,"qualificacao_do_responsavel":49,"descricao_situacao_cadastral":"BAIXADA","descricao_tipo_de_logradouro":"RUA","descricao_motivo_situacao_cadastral":"EXTINCAO POR ENCERRAMENTO LIQUIDACAO VOLUNTARIA","descricao_identificador_matriz_filial":"MATRIZ"}')
    // const result = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormated}`)
    // if (!result.ok) throw Error('invalid cnpj', { cause: 'visibleError' })
    // const resultFormated = await result.json()
    // return resultFormated
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export interface RestaurantFormData {
  cnpj: string
  stateNumberId: string
  cityNumberId: string
  restaurantName: string
  legalRestaurantName: string
  zipcode: string
  neigh: string
  street: string
  localNumber: string
  complement: string
  phone: string
  alternativePhone: string
  email: string
  alternativeEmail: string
  step: number
  loading: boolean
  noStateNumberId: boolean
  minHour: string
  maxHour: string
  closeDoor: boolean
  deliveryObs: string
  weeklyOrderAmount: string
  orderValue: string
  paymentWay: string
  minhours: string[]
  maxhours: string[]
  localType: string
  city: string
  inviteCode?: string
}

export interface addressFormData {
  minHour: string
  maxHour: string
  deliveryObs: string
  neigh: string
  street: string
  localNumber: string
  zipcode: string
  complement: string
  restaurantId: string[]
  id: string
  active: boolean
  responsibleReceivingName: string
  responsibleReceivingPhoneNumber: string
  updatedAt: Date
  createdAt: Date
  localType: string
  city: string
  closedDoorDelivery: boolean
}

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

const createRegisterAirtable = async (req: CreateRegisterAirtable): Promise<AirtableRecord<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_REGISTER_ID ?? '').table(process.env.AIRTABLE_TABLE_REGISTER_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}

export const fullRegister = async (req: RestaurantFormData & { token: string }): Promise<void> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const restaurantId = uuidv4()
    const addressId = uuidv4()

    const maxHourF = DateTime.fromFormat(req.maxHour, 'HH:mm')
    const maxHourFormated = maxHourF.toISOTime()
    const minHourF = DateTime.fromFormat(req.minHour, 'HH:mm')
    const minHourFormated = minHourF.toISOTime()
    const isoFormattedTimeMax = `2024-01-01T${maxHourFormated?.substring(0, 12)}000Z`
    const isoFormattedTimeMin = `2024-01-01T${minHourFormated?.substring(0, 12)}000Z`

    console.log(isoFormattedTimeMax)
    console.log(isoFormattedTimeMin)

    const addressData = {
      active: true,
      complement: req.complement,
      createdAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      updatedAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      deliveryObs: req.deliveryObs,
      id: addressId,
      localNumber: req.localNumber,
      maxHour: isoFormattedTimeMax ?? '',
      minHour: isoFormattedTimeMin ?? '',
      neigh: req.neigh,
      street: req.street,
      zipcode: req.zipcode,
      restaurantId: [restaurantId],
      responsibleReceivingName: '',
      responsibleReceivingPhoneNumber: req.phone,
      localType: req.localType,
      city: req.city,
      closedDoorDelivery: req.closeDoor
    }

    await registerAddress(addressData)

    let count = await checkClientCount()
    if (count == null) {
      count = { externalId: 1 }
    }

    count.externalId++

    const restData = {
      companyRegistrationNumber: req.cnpj,
      name: req.restaurantName,
      externalId: `C${count.externalId}`,
      companyRegistrationNumberForBilling: req.cnpj,
      stateRegistrationNumber: req.stateNumberId,
      active: true,
      alternativeEmail: req.alternativeEmail,
      email: req.email,
      alternativePhone: req.alternativePhone,
      closeDoor: req.closeDoor,
      phone: req.phone,
      cityRegistrationNumber: req.cityNumberId,
      id: restaurantId,
      orderValue: Number(req.orderValue),
      weeklyOrderAmount: Number(req.weeklyOrderAmount),
      legalName: req.legalRestaurantName,
      createdAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      updatedAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
      user: [decoded.id],
      address: [addressId],
      favorite: [],
      paymentWay: req.paymentWay,
      premium: Number(req.orderValue) > 400
    }

    await createRestaurant(restData)

    await removeClientCount()
    await addClientCount(count.externalId)

    function capitalizeWithExceptions (text: string): string {
      const prepositions = ['da', 'do', 'de', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o']

      return text
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
          if (index > 0 && prepositions.includes(word)) {
            return word
          }
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
    }

    await updateUserWithRestaurant(decoded.id, restaurantId, DateTime.now().setZone('America/Sao_Paulo').toJSDate())
    await createRegisterAirtable({
      'A partir de que horas seu estabelecimento está disponível para recebimento de hortifrúti?': req.minHour,
      'ID pagamento': req.paymentWay,
      'Nome do estabelecimento': req.restaurantName,
      CNPJ: req.cnpj,
      'Inscrição estadual': req.noStateNumberId ? req.cityNumberId : req.stateNumberId,
      Rua: `${req.localType} ${req.street}`,
      Número: req.localNumber,
      Complemento: req.complement,
      'CEP de entrega': req.zipcode,
      Bairro: capitalizeWithExceptions(req.neigh),
      Cidade: req.city,
      'Portas fechadas': req.closeDoor,
      'Razão social': req.legalRestaurantName,
      Premium: Number(req.orderValue) >= 400,
      'Ticket médio cadastrado': req.orderValue.toString(),
      'Telefone para contato com DDD': req.phone,
      'Até que horas o seu estabelecimento pode receber o pedido?': req.maxHour,
      'PJ ou PF': 'Pessoa Jurídica',
      'Termos e condições': 'Li e aceito',
      'E-mail para comunicados': req.email,
      'Código Promotor': req.inviteCode ?? '',
      'Quantas vezes em média na semana você faz pedidos?': req.weeklyOrderAmount,
      'Cadastrado por': 'App'
    })
  } catch (err) {
    console.log(err)
  }
}
