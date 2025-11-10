import { type FastifyInstance } from 'fastify';
import { alertsRoutes } from './alertRoute';
import { AppVersionRoute } from './appVersionRoute';
import { authRoute } from './authRoute';
import { cartRoute } from './cartRoute';
import { classeProdutoRoute } from './classeProdutoRoute';
import { combinationRoute } from './combinationRoute';
import { confirmRoute } from './confirmRoute';
import { cumulativeReportRoute } from './cumulativeReportRoute';
import { favoriteRoute } from './favoriteRoute';
import { interRoute } from './interRoute';
import { invoiceRoute } from './invoiceRoute';
import { orderRoute } from './orderRoute';
import { priceRoute } from './priceRoute';
import { productRoute } from './productRoute';
import { quotationEngineRoute } from './quotationEngineRoute';
import { registerRoute } from './registerRoute';
import { restaurantRoute } from './restaurantRoute';
import { s3Route } from './s3Route';
import { supplierRoute } from './supplierRoute';
import { userRoute } from './userRoute';

export const registerRoutes = async (server: FastifyInstance): Promise<void> => {
  await Promise.all([
    server.register(authRoute),
    server.register(cumulativeReportRoute),
    server.register(productRoute),
    server.register(favoriteRoute),
    server.register(cartRoute),
    server.register(priceRoute),
    server.register(confirmRoute),
    server.register(registerRoute),
    server.register(restaurantRoute),
    server.register(interRoute),
    server.register(orderRoute),
    server.register(invoiceRoute),
    server.register(AppVersionRoute),
    server.register(s3Route),
    server.register(combinationRoute),
    server.register(quotationEngineRoute),
    server.register(classeProdutoRoute),
    server.register(supplierRoute),
    server.register(alertsRoutes),
    server.register(userRoute),
  ]);
};
