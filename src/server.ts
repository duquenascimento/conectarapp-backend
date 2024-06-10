import Fastify, { type FastifyInstance } from 'fastify'
import { registerRoutes } from './route/route'
import { DateTime } from 'luxon'

const server: FastifyInstance = Fastify({})

async function startServer (): Promise<void> {
  try {
    await registerRoutes(server)
    await server.listen({ port: 9841, host: '192.168.201.96' })
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
