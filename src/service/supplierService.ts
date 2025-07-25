import { findSupplierByExternalId } from '../repository/supplierRepository'
import { logRegister } from '../utils/logUtils'

export const findByExternalId = async (externalId: string): Promise<any> => {
  try {
    const restaurant = await findSupplierByExternalId(externalId)
    return restaurant
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
