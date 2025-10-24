import { base, type FieldSet } from 'airtable'
import { type ProductAirtable } from './types'
import { logRegister } from '../utils/logUtils'

export const findProductsIdsFromAirtable = async (
  valuesToFilter: string[]
): Promise<ProductAirtable[]> => {
  const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(
    process.env.AIRTABLE_TABLE_PRODUCT_NAME ?? ''
  )
  const filterByFormula = `OR(${valuesToFilter
    .map((value) => `{ID_Produto} = "${value}"`)
    .join(', ')})`
  try {
    const records = await _.select({
      filterByFormula
    }).all()

    if (records.length > 0) {
      return records.map((record) => {
        return {
          productId: record.fields.ID_Produto as string,
          airtableId: record.id
        }
      })
    } else {
      return []
    }
  } catch (err) {
    void logRegister(err, false)
    throw new Error('Falha ao buscar produtos no airTable')
  }
}
