import { type order_invoice } from '@prisma/client'
import { findInvoice, upsertInvoice } from '../repository/invoiceRepository'
import { saveFile } from '../utils/utils'

export const upsert = async ({
  filePath,
  orderId
}: Pick<order_invoice, 'filePath' | 'orderId'>): Promise<void> => {
  console.log('Iniciando upsert no service...')
  console.log('orderId recebido:', orderId)
  console.log('filePath recebido:', filePath)

  // Processa os arquivos
  const files = await Promise.all(
    filePath.map(async (file, i) => {
      console.log(`Processando arquivo ${i + 1} de ${filePath.length}:`, file)
      const savedFileUrl = await saveFile(file, `invoice-${i}-${orderId}.pdf`)
      if (!savedFileUrl) {
        console.error(`Falha ao salvar o arquivo ${file}`)
        return null
      }
      console.log(`Arquivo ${i + 1} salvo com sucesso. URL:`, savedFileUrl)
      return savedFileUrl
    })
  )

  // Filtra os arquivos salvos com sucesso
  const validFiles = files.filter((file): file is string => file !== null)

  console.log('Arquivos processados:', validFiles)

  // Chama o upsertInvoice para criar ou atualizar o registro
  if (validFiles.length > 0) {
    console.log('Chamando upsertInvoice com os seguintes dados:')
    console.log('orderId:', orderId)
    console.log('filePath:', validFiles)
    await upsertInvoice(orderId, validFiles)
  } else {
    console.error('Nenhum arquivo foi salvo com sucesso.')
  }
}
