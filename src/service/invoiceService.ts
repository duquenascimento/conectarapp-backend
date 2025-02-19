import { type order_invoice } from '@prisma/client'
import { findInvoice, upsertInvoice } from '../repository/invoiceRepository'
import { saveFile } from '../utils/utils'

export const upsert = async ({
  filePath,
  orderId
}: Pick<order_invoice, 'filePath' | 'orderId'>): Promise<void> => {
  const invoiceExist = await findInvoice(orderId)
  if (invoiceExist == null) return
  const files = filePath.map(async (file, i) => {
    return await saveFile(file, `invoice-${i}.pdf`)
  })

  if (files.length > 0) {
    await upsertInvoice(orderId, files as unknown as string[])
  }
}
