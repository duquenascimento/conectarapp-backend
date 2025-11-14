import { DateTime } from 'luxon'
import { checkOrder, checkPremiumOrder } from '../repository/confirmRepository'

export const generateOrderId = async (premium: boolean, externalId: string) => {
  const diferencaEmMilissegundos = Math.abs(DateTime.fromISO('1900-01-01', { zone: 'America/Sao_Paulo' }).toMillis() - DateTime.now().setZone('America/Sao_Paulo').toMillis())
  const milissegundosPorDia = 1000 * 60 * 60 * 24
  const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2

  let orderId = `${diferencaEmDias}_${externalId}`
  let checkOrderId = 0

  if (premium) {
    checkOrderId = await checkPremiumOrder(orderId)
  } else {
    checkOrderId = await checkOrder(orderId)
  }
  if (checkOrderId !== 0) {
    orderId = `${orderId}_P${checkOrderId + 1}`
  }

  return orderId
}
