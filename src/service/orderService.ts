import { type order } from '@prisma/client'
import { findById, cancelById } from '../repository/orderRepository'
import { logRegister } from '../utils/logUtils'
import { isSameDay, isTimeWithinMinutes } from '../utils/dateUtils'

export const findOrder = async (id?: string): Promise<order> => {
  try {
    const result = await findById(id ?? '')
    if (result == null) throw new Error('not found', { cause: 'visibleError' })
    return result
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}

export const cancelOrder = async (id?: string): Promise<void> => {
  try {
    if (id == null) throw new Error('invalid id', { cause: 'visibleError' })
    const order = await findOrder(id)
    if (order == null) throw new Error('order not found', { cause: 'visibleError' })

    const minutesToCancelOrder = process.env.MINUTES_TO_CANCEL_ORDER
    const minutesToCancelOrderFinal = Number.isSafeInteger(minutesToCancelOrder) ? Number(minutesToCancelOrder) : 15

    if (
      (isSameDay(order.orderDate, new Date()) &&
        isTimeWithinMinutes(order.orderHour, new Date(), minutesToCancelOrderFinal))
    ) throw new Error(`to cancel it must be within ${minutesToCancelOrderFinal} minutes`, { cause: 'visibleError' })

    await cancelById(id)
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
