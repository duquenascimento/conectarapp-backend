import { configure, base, type FieldSet } from 'airtable'
import { type CreateRegisterAirtable, type AirtableResponse } from './types'
configure({
  apiKey: process.env.AIRTABLE_TOKEN ?? ''
})

export const createRegisterAirtable = async (req: CreateRegisterAirtable): Promise<AirtableResponse | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_REGISTER_ID ?? '').table(process.env.AIRTABLE_TABLE_REGISTER_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}
