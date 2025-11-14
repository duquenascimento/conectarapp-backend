import { base, type FieldSet } from 'airtable'
import { type CreateOrderTextAirtable, type AirtableResponse } from './types'
import { logRegister } from '../utils/logUtils'

export const createOrderTextAirtable = async (req: CreateOrderTextAirtable): Promise<AirtableResponse> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDERTEXT_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERTEXT_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error('airtable error>>>>>>', err)
    void logRegister(err)
  }
}
