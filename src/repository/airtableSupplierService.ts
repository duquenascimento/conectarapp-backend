import { base } from 'airtable'
import { logRegister } from '../utils/logUtils'

export const findIdFromAirtable = async (tableName: string, fieldToFilter: string, valueToFilter: string, baseName: string): Promise<string> => {
  const _ = base(baseName).table(tableName)
  const filterByFormula = `{${fieldToFilter}} = "${valueToFilter}"`
  try {
    const records = await _.select({
      filterByFormula
    }).all()
    if (records.length > 0) {
      return records[0].id
    } else {
      return ''
    }
  } catch (err) {
    void logRegister(err)
    return ''
  }
}
