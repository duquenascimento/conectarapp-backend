import { type order_invoice } from '@prisma/client'
import { findInvoice, upsertInvoice } from '../repository/invoiceRepository'
import { saveFile } from '../utils/utils'
import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'

export const upsert = async ({ filePath, orderId }: Pick<order_invoice, 'filePath' | 'orderId'>): Promise<void> => {
  // Processa os arquivos
  const files = await Promise.all(
    filePath.map(async (file, i) => {
      // const savedFileUrl = await saveFile(file, `invoice-${i}-${orderId}.pdf`)
      const savedFileUrl = await uploadPdfFileToS3(file, `NF/invoice-${i}-${orderId}.pdf`)
      if (!savedFileUrl) {
        console.error(`Falha ao salvar o arquivo ${file}`)
        return null
      }
      return savedFileUrl
    })
  )

  // Filtra os arquivos salvos com sucesso
  const validFiles = files.filter((file): file is string => file !== null)

  // Chama o upsertInvoice para criar ou atualizar o registro
  if (validFiles.length > 0) {
    await upsertInvoice(orderId, validFiles)
  } else {
    console.error('Nenhum arquivo foi salvo com sucesso.')
  }
}
