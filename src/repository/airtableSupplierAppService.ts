import { base, type FieldSet } from 'airtable'
import { type CreateOrderSupplierAppAirtable, type AirtableResponse } from './types'
import { logRegister } from '../utils/logUtils'

export const createOrderSupplierAppAirtable = async (req: CreateOrderSupplierAppAirtable): Promise<AirtableResponse> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERSUPPLIERAPP_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    void logRegister(err)
  }
}
