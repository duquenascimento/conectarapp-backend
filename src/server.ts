import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { registerRoutes } from './route/route'
import { DateTime } from 'luxon'

const server: FastifyInstance = Fastify({})

async function startServer (): Promise<void> {
  try {
    await Promise.all([
      server.register(cors, {
        origin: ['http://localhost:8081', 'http://localhost:3000', 'https://beta.conectarapp.com.br', 'https://pedido.conectarapp.com.br'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }),
      registerRoutes(server)
    ])
    await server.listen({ port: 9841 })
    console.info(`Server started in ${DateTime.now().setZone('America/Sao_Paulo').toJSDate().toString()}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

startServer().catch(err => {
  console.error(err)
  process.exit(1)
})
