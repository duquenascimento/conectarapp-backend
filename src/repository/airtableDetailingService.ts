import { base, type FieldSet, type Records } from 'airtable'
import { type CreateDetailingAirtable, type AirtableResponse } from './types'
import { logRegister } from '../utils/logUtils'

export const createDetailingAirtable = async (
  req: CreateDetailingAirtable[]
): Promise<AirtableResponse> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(
      process.env.AIRTABLE_TABLE_DETAILING_NAME ?? ''
    )
    const detailing = await _.create(
      req.map((record) => ({ fields: record as unknown as Partial<FieldSet> }))
    )
    return detailing
  } catch (err) {
    console.error('Falha na criação de detalhamento de pedidos')
    void logRegister(err)
    return undefined
  }
}
