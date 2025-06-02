import { type order_invoice } from '@prisma/client'
import { upsertInvoice } from '../repository/invoiceRepository'
import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'
import { createFileLog } from '../repository/fileLogRepository'
import { HttpException } from '../errors/httpException'
import { findPremiumByOrderId, insertIncrementalPremiumOrder } from '../repository/confirmRepository'

export const upsert = async ({ filePath, orderId, premium }: Pick<order_invoice, 'filePath' | 'orderId' | 'premium'>): Promise<void> => {
  if (!orderId || !Array.isArray(filePath) || filePath.length === 0) {
    throw new HttpException('orderId e arquivos são obrigatórios para envio de nota fiscal.', 400)
  }

  if (premium) {
    const premiumOrder = await findPremiumByOrderId(orderId)
    if (!premiumOrder) {
      await insertIncrementalPremiumOrder(orderId)
    }
  }

  const files: Array<string | null> = await Promise.all(
    filePath.map(async (file, i) => {
      const s3Key = `NF/invoice-${i}-${orderId}.pdf`
      try {
        return await uploadPdfFileToS3(file, s3Key)
      } catch (err) {
        const statusCode = err instanceof HttpException ? err.statusCode : 500
        const message = err instanceof HttpException ? err.message : 'Erro desconhecido ao enviar nota fiscal para o S3'

        await createFileLog({
          fileUrl: file,
          entity: 'order_invoice',
          entityId: orderId,
          message,
          status: 'FAIL',
          httpStatus: statusCode
        })

        return null
      }
    })
  )

  const validFiles = files.filter((file): file is string => file !== null)

  if (validFiles.length > 0) {
    try {
      await upsertInvoice(orderId, validFiles, premium)

      await createFileLog({
        fileUrl: JSON.stringify(validFiles),
        entity: premium ? 'order_invoice (premium)' : 'order_invoice',
        entityId: orderId,
        message: 'Notas salvas com sucesso na base de dados',
        status: 'SUCCESS',
        httpStatus: 200
      })
    } catch (err) {
      const statusCode = err instanceof HttpException ? err.statusCode : 500
      const message = err instanceof HttpException ? err.message : 'Erro desconhecido ao salvar notas na base de dados'

      await createFileLog({
        fileUrl: JSON.stringify(validFiles),
        entity: premium ? 'order_invoice (premium)' : 'order_invoice',
        entityId: orderId,
        message,
        status: 'FAIL',
        httpStatus: statusCode
      })

      throw new HttpException(message, statusCode)
    }
  } else {
    await createFileLog({
      fileUrl: JSON.stringify(filePath),
      entity: premium ? 'premiumOrder' : 'order',
      entityId: orderId,
      message: 'Nenhum arquivo foi processado com sucesso na base de dados',
      status: 'FAIL',
      httpStatus: 422
    })
    throw new HttpException('Erro ao processar todos os arquivos de nota fiscal', 422)
  }
}
