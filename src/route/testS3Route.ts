import { type FastifyInstance, type FastifyRequest } from 'fastify'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configuração do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export const testS3Route = async (server: FastifyInstance) => {
  server.post('/test-upload', async (request: FastifyRequest, reply) => {
    try {
      // 1. Extrai o arquivo do corpo da requisição (multipart/form-data)
      const data = await request.file()
      if (!data) {
        return await reply.status(400).send({ error: 'Nenhum arquivo enviado.' })
      }

      const fileBuffer = await data.toBuffer() // Converte para Buffer
      const fileName = `test-${Date.now()}-${data.filename}` // Nome único

      // 2. Envia para o S3
      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: `uploads/${fileName}`, // Pasta "uploads/" no bucket
        Body: fileBuffer,
        ContentType: data.mimetype
      })

      await s3Client.send(command)

      // 3. Retorna a URL pública do arquivo
      const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`
      return await reply.status(200).send({ url: fileUrl })
    } catch (err) {
      console.error('Erro no upload:', err)
      return await reply.status(500).send({ error: 'Falha ao enviar arquivo.' })
    }
  })
}
