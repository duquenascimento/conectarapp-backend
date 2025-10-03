import { type FastifyPluginAsync } from 'fastify';
import { authenticateToken } from '../middleware/authMiddleware';

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    const publicRoutes = [
      '/auth/signin',
      '/auth/signup',
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
};
