import { configure, base, type FieldSet } from 'airtable'
import { type CreateRegisterAirtable, type UpdateAddressRegisterAirtable, type AirtableResponse, type CreateUserAirtable, type UpdateUserAirtable } from './types'
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

export const createUserAirtable = async (req: CreateUserAirtable): Promise<AirtableResponse | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_DBCLIENTE_ID ?? '').table(process.env.AIRTABLE_TABLE_DB_USUARIOS_REST ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}

export const updateUserAirtable = async (req: UpdateUserAirtable): Promise<AirtableResponse | undefined> => {
  try {
    const ID_Usuario = req['ID_Usuário']
    if (!ID_Usuario) {
      throw new Error('ID_Usuário é obrigatório para atualizar o Airtable')
    }

    const _ = base(process.env.AIRTABLE_BASE_DBCLIENTE_ID ?? '').table(process.env.AIRTABLE_TABLE_DB_USUARIOS_REST ?? '')

    // Buscar o registro pelo campo "ID_Usuário"
    const records = await _.select({
      filterByFormula: `{ID_Usuário} = '${ID_Usuario}'`,
      maxRecords: 1
    }).firstPage()

    if (!records || records.length === 0) {
      throw new Error(`Registro com ID_Usuário ${ID_Usuario} não encontrado no Airtable`)
    }

    const recordId = records[0].id

    // Remove o ID_Usuário dos campos a serem atualizados
    const { ID_Usuário: _ignore, ...fields } = req

    const update = await _.update(recordId, fields as Partial<FieldSet>)
    return update
  } catch (err) {
    console.error('Erro ao atualizar usuário no Airtable:', err)
  }
}
