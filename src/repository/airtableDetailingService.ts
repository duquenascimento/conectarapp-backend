import { base, type FieldSet, type Records } from 'airtable'
import { type CreateDetailingAirtable, type AirtableResponse } from './types'
import { logRegister } from '../utils/logUtils'
import { HttpException } from '../errors/httpException'

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
    void logRegister(err, false)
    const errorMessage = err instanceof Error ? err.message : String(err)
    throw new HttpException(
      `Falha ao enviar dados de detalhamento do pedido ao airTable: ${errorMessage}`,
      422
    )
    // return undefined
  }
}
