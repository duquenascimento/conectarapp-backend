import { logRegister } from '../utils/logUtils'
import { findRestaurantByCompanyRegistrationNumber, registerAddress, updateUserWithRestaurant } from '../repository/restaurantRepository'
import { createRestaurant } from './restaurantService'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'
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
    const result = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormated}`)
    if (!result.ok) throw Error('invalid cnpj', { cause: 'visibleError' })
    const resultFormated = await result.json()
    return resultFormated
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
}

export const fullRegister = async (req: RestaurantFormData & { token: string }): Promise<void> => {
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

  await registerAddress({
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
    responsibleReceivingPhoneNumber: '',
    localType: req.localType,
    city: req.city
  })

  await createRestaurant({
    companyRegistrationNumber: req.cnpj,
    name: req.restaurantName,
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
    paymentWay: req.paymentWay
  })

  await updateUserWithRestaurant(decoded.id, restaurantId, DateTime.now().setZone('America/Sao_Paulo').toJSDate())
}
