import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createCanvas } from 'canvas'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { HttpException } from '../errors/httpException'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadToS3 (buffer: Buffer, key: string, contentType: string): Promise<string> {
  const bucket = process.env.BUCKET_NAME!

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  })

  try {
    await s3Client.send(command)
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  } catch (error) {
    const metadata = (error as any)?.$metadata
    const statusCode = metadata?.httpStatusCode ? Number(metadata.httpStatusCode) : 500
    const message = (error as Error).message ? (error as Error).message : 'Erro desconhecido ao enviar para o S3'
    throw new HttpException(message, statusCode)
  }
}

export async function uploadQRCodeToS3 (text: string, s3Key: string): Promise<string> {
  try {
    const qrImage = await QRCode.toBuffer(text, { type: 'png', width: 100 })
    return await uploadToS3(qrImage, s3Key, 'image/png')
  } catch (error) {
    throw new Error(`Erro ao gerar ou enviar QR Code: ${(error as Error).message}`)
  }
}

export async function uploadBarcodeToS3 (barcodeValue: string, s3Key: string): Promise<string> {
  try {
    const canvas = createCanvas(0, 0)
    JsBarcode(canvas, barcodeValue, {
      format: 'ITF',
      width: 2,
      height: 100,
      displayValue: false
    })
    const buffer = Buffer.from(canvas.toDataURL('image/png').split(',')[1], 'base64')
    return await uploadToS3(buffer, s3Key, 'image/png')
  } catch (error) {
    throw new Error(`Erro ao gerar ou enviar código de barras: ${(error as Error).message}`)
  }
}

export async function uploadPdfFileToS3 (pdfUrl: string, s3Key: string): Promise<string> {
  const response = await fetch(pdfUrl)

  if (!response.ok) {
    throw new HttpException(`Falha ao carregar arquivo ${pdfUrl}: ${response.statusText}`, response.status)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return await uploadToS3(buffer, s3Key, 'application/pdf')
}
