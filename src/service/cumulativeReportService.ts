import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'
import { type ReportData } from '../types/cummulativeTypes'

export const createCumulativeReport = async (data: ReportData): Promise<string> => {
  try {
    const { url, fileName } = data
    const s3Path = `reports/cumulative/${fileName}`
    return await uploadPdfFileToS3(url, s3Path)
  } catch (error) {
    throw new Error('Erro ao enviar relatório para o s3')
  }
}
