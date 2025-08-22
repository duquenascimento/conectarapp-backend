import { logRegister } from '../utils/logUtils'
import { findRestaurantByCompanyRegistrationNumber, registerAddress, updateUserWithRestaurant } from '../repository/restaurantRepository'
import { createRestaurant } from './restaurantService'
import { DateTime } from 'luxon'
import { configure } from 'airtable'
import { decode } from 'jsonwebtoken'
import { fetchCNPJData } from './cnpjService'
import { createRegisterAirtable } from '../repository/airtableRegisterService'
import { mapCnpjData } from '../utils/mapCnpjData'
import { validateDocument } from '../utils/validateDocument'
import { v4 as uuidv4 } from 'uuid'
import { logRecord } from '../utils/log-utility'

export interface CheckCnpj {
  cnpj: string
}

export const checkCnpj = async ({ cnpj }: CheckCnpj): Promise<any> => {
  try {
    const cnpjFormated = cnpj.toLowerCase().trim()
    const valida = validateDocument(cnpj)
    if (!valida) throw Error('invalid cnpj', { cause: 'visibleError' })

    const cnpjExists = await findRestaurantByCompanyRegistrationNumber(cnpjFormated)
    if (cnpjExists != null) throw Error('already exists', { cause: 'visibleError' })
    const result = await fetchCNPJData(cnpjFormated)
    const mappedResult = mapCnpjData(result)
    if (mappedResult.status !== 200) {
      console.error('Erro ao mapear os dados do CNPJ:', mappedResult)
      return mappedResult
    }

    return mappedResult.data
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
  responsibleReceivingName: string
  responsibleReceivingPhoneNumber: string
  weeklyOrderAmount: string
  orderValue: string
  paymentWay: string
  minhours: string[]
  maxhours: string[]
  localType: string
  city: string
  inviteCode?: string
  emailBilling: string
  financeResponsibleName: string
  financeResponsiblePhoneNumber: string
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

export const fullRegister = async (req: RestaurantFormData & { token: string }): Promise<void> => {
  try {
    const decoded = decode(req.token) as { id: string }
    const addressId = uuidv4()
    const restaurantId = uuidv4()
    const maxHourF = DateTime.fromFormat(req.maxHour, 'HH:mm')
    const maxHourFormated = maxHourF.toISOTime()
    const minHourF = DateTime.fromFormat(req.minHour, 'HH:mm')
    const minHourFormated = minHourF.toISOTime()
    const isoFormattedTimeMax = `2024-01-01T${maxHourFormated?.substring(0, 12)}000Z`
    const isoFormattedTimeMin = `2024-01-01T${minHourFormated?.substring(0, 12)}000Z`

    const dataForRegister = {
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
      'Cadastrado por': 'App',
      'Nome responsável financeiro': req.financeResponsibleName,
      'Telefone do responsável financeiro com DDD': req.financeResponsiblePhoneNumber,
      'E-mail financeiro para envio de cobranças': req.emailBilling
    }

    await logRecord({
      level: 'info',
      message: 'Dados para registro no AirTable:',
      data: dataForRegister,
      location: 'registerService.fullRegister'
    })

    const airtableRecord = await createRegisterAirtable(dataForRegister)

    if (!airtableRecord || typeof airtableRecord !== 'object' || !('fields' in airtableRecord)) {
      await logRecord({
        level: 'error',
        message: 'Falha ao criar registro no Airtable ou estrutura do registro inválida',
        data: dataForRegister,
        location: 'registerService.fullRegister'
      })

      throw new Error('Falha ao criar registro no Airtable ou estrutura do registro inválida')
    }

    if (!airtableRecord.fields || typeof airtableRecord.fields !== 'object' || !('ID_Cliente' in airtableRecord.fields)) {
      await logRecord({
        level: 'error',
        message: 'ID_Cliente não encontrado no registro do Airtable',
        data: dataForRegister,
        location: 'registerService.fullRegister'
      })
      throw new Error('ID_Cliente não encontrado no registro do Airtable')
    }

    const externalId = airtableRecord.fields.ID_Cliente as string

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
      responsibleReceivingName: req.responsibleReceivingName,
      responsibleReceivingPhoneNumber: req.responsibleReceivingPhoneNumber,
      localType: req.localType,
      city: req.city,
      closedDoorDelivery: req.closeDoor
    }

    const restData = {
      companyRegistrationNumber: req.cnpj,
      name: req.restaurantName,
      externalId,
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
      premium: Number(req.orderValue) >= 400,
      registrationReleasedNewApp: true,
      emailBilling: req.emailBilling,
      financeResponsibleName: req.financeResponsibleName,
      financeResponsiblePhoneNumber: req.financeResponsiblePhoneNumber
    }

    await createRestaurant(restData)
    await registerAddress(addressData)

    await updateUserWithRestaurant(decoded.id, restaurantId, DateTime.now().setZone('America/Sao_Paulo').toJSDate())
  } catch (err) {
    await logRecord({
      level: 'error',
      message: 'Erro ao registrar dados do restaurante',
      data: err,
      location: 'registerService.fullRegister'
    })
    console.error(err)
  }
}

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
