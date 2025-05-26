import { configure, base, type FieldSet } from 'airtable'
import { type CreateRegisterAirtable, type UpdateAddressRegisterAirtable, type AirtableResponse } from './types'
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

export const findRecordIdByClientId = async (externaId: string): Promise<string | undefined> => {
  try {
    const table = base(process.env.AIRTABLE_BASE_DBCLIENTE_ID ?? '').table(process.env.AIRTABLE_TABLE_DBCLIENTE_NAME ?? '')

    const records = await table
      .select({
        filterByFormula: `{ID_Cliente} = '${externaId}'`,
        maxRecords: 1
      })
      .firstPage()
    return records[0]?.id
  } catch (err) {
    console.error('Erro ao buscar recordId no Airtable:', err)
    return undefined
  }
}

export const updateAddressRegisterAirtable = async (req: UpdateAddressRegisterAirtable & { ID_Cliente: string }): Promise<AirtableResponse | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_DBCLIENTE_ID ?? '').table(process.env.AIRTABLE_TABLE_DBCLIENTE_NAME ?? '')

    const { ID_Cliente, ...fields } = req

    const update = await _.update(ID_Cliente, fields as Partial<FieldSet>)
    return update
  } catch (err) {
    console.error(err)
  }
}
