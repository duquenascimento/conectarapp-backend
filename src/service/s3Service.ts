import { HttpException } from '../errors/httpException'
import { createFileLog } from '../repository/fileLogRepository'
import { type s3PdfRequestData } from '../types/s3FileTypes'
import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'

export const uploadPdf = async ({ url, fileName }: s3PdfRequestData): Promise<string> => {
  if (!url) {
    throw new HttpException('URL do PDF é obrigatória', 400)
  }
  const s3Key = `boleto/boleto-${fileName}.pdf`

  try {
    const s3Url = await uploadPdfFileToS3(url, s3Key)

    await createFileLog({
      fileUrl: url,
      entity: 'boleto',
      entityId: s3Key,
      message: 'Boleto salvo no S3',
      status: 'SUCCESS',
      httpStatus: 200
    })

    return s3Url
  } catch (error) {
    const statusCode = error instanceof HttpException ? error.statusCode : 500
    const message = error instanceof HttpException ? error.message : 'Erro desconhecido ao enviar PDF para o S3'

    await createFileLog({
      fileUrl: url,
      entity: 'boleto',
      entityId: s3Key,
      message,
      status: 'FAIL',
      httpStatus: statusCode
    })

    throw new HttpException(message, statusCode)
  }
}
