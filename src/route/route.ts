import { type FastifyInstance } from 'fastify'
import { authRoute } from './authRoute'
import { productRoute } from './productRoute'
import { favoriteRoute } from './favoriteRoute'

export const registerRoutes = async (server: FastifyInstance): Promise<void> => {
  await server.register(authRoute)
  await server.register(productRoute)
  await server.register(favoriteRoute)
}
