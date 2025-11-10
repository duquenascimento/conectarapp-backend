import Fastify, { type FastifyPluginCallback, type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { registerRoutes } from './route/route'
import { DateTime } from 'luxon'
import * as dotenv from 'dotenv'
import multipart from '@fastify/multipart'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const server: FastifyInstance = Fastify({})

async function startServer(): Promise<void> {
  try {
    await Promise.all([
      server.register(cors, {
        origin: ['http://localhost:8081', 'http://localhost:3000', 'http://localhost:3333', 'https://beta.conectarapp.com.br', 'https://pedido.conectarapp.com.br'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    ])
    await server.register(multipart)
    server.setErrorHandler(errorHandler)
    await registerRoutes(server)
    const port = parseInt(process.env.PORT ?? '9841', 10)
    const host = process.env.HOST ?? '192.168.201.96'

    if (isNaN(port)) {
      throw new Error('Invalid port number. Please check the PORT environment variable.')
    }
    const address = await server.listen({ port, host })
    console.info(`Server started at ${address} on ${DateTime.now().setZone('America/Sao_Paulo').toJSDate().toString()}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

startServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
