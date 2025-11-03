import fp from 'fastify-plugin';
import { authenticateToken } from '../middleware/authMiddleware';

export const authPlugin = fp(async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    const publicRoutes = [
      '/auth/signin',
      '/auth/signup',
      '/auth/checkLogin',
      '/auth/recovery',
      '/auth/recoveryCheck',
      '/auth/pwChange',
      '/uploadPdf',
    ];

    if (publicRoutes.includes(request.routerPath)) {
      return;
    }

    await authenticateToken(request, reply);
  });
});
