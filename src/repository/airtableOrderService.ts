import { base, type FieldSet } from 'airtable'
import { type CreateOrderAirtable, type AirtableResponse } from './types'
import { logRegister } from '../utils/logUtils'

export const createOrderAirtable = async (req: CreateOrderAirtable): Promise<AirtableResponse | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDER_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error('airtable err cretae order>>>>>>', req)
    void logRegister(err)
  }
}
