import { type FastifyInstance } from 'fastify'
import { authRoute } from './authRoute'
import { productRoute } from './productRoute'
import { favoriteRoute } from './favoriteRoute'
import { cartRoute } from './cartRoute'
import { priceRoute } from './priceRoute'
import { confirmRoute } from './confirmRoute'
import { registerRoute } from './registerRoute'
import { restaurantRoute } from './restaurantRoute'
import { interRoute } from './interRoute'
import { orderRoute } from './orderRoute'
import { invoiceRoute } from './invoiceRoute'
import { cumulativeReportRoute } from './cumulativeReportRoute'
import { AppVersionRoute } from './appVersionRoute'
import { s3Route } from './s3Route'
import { combinationRoute } from './combinationRoute'

export const registerRoutes = async (server: FastifyInstance): Promise<void> => {
  await Promise.all([server.register(authRoute), server.register(cumulativeReportRoute), server.register(productRoute), server.register(favoriteRoute), server.register(cartRoute), server.register(priceRoute), server.register(confirmRoute), server.register(registerRoute), server.register(restaurantRoute), server.register(interRoute), server.register(orderRoute), server.register(invoiceRoute), server.register(AppVersionRoute), server.register(s3Route), server.register(combinationRoute)])
}
