import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'
import { type ReportData } from '../types/cummulativeTypes'
import { HttpException } from '../errors/httpException'
import { createFileLog } from '../repository/fileLogRepository'

export const createCumulativeReport = async (data: ReportData): Promise<string> => {
  const { url, fileName } = data

  if (!url || !fileName) {
    throw new HttpException('Dados incompletos: url e fileName são obrigatórios', 422)
  }

  const s3Path = `reports/cumulative/${fileName}`
  try {
    const s3Url = await uploadPdfFileToS3(url, s3Path)

    await createFileLog({
      fileUrl: s3Url,
      entity: 'cumulative_report',
      entityId: fileName,
      message: 'Relatório de acumulado salvo com sucesso',
      status: 'SUCCESS',
      httpStatus: 200
    })

    return s3Url
  } catch (err) {
    const statusCode = err instanceof HttpException ? err.statusCode : 500
    const message = err instanceof HttpException ? err.message : 'Erro desconhecido ao enviar acumulado para o S3'

    await createFileLog({
      fileUrl: url,
      entity: 'cumulative_report',
      entityId: fileName,
      message,
      status: 'FAIL',
      httpStatus: statusCode
    })

    throw new HttpException(message, statusCode)
  }
}
