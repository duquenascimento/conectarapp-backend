import { FastifyInstance } from 'fastify';
import * as jwt from 'jsonwebtoken';
import { findUserById, setUserAsInactive } from '../service/userService';
import { UserResponse } from '../types/userResponseType';

export const userRoute = async (server: FastifyInstance): Promise<any> => {
  server.get('/user', async (req, res): Promise<any> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return await res.status(401).send({ message: 'Token não fornecido' });
      }

      const [, token] = authHeader.split(' ');
      if (!token) {
        return await res.status(401).send({ message: 'Formato do header inválido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const userId = decoded.id;

      const user = await findUserById(userId);
      if (!user) {
        return await res.status(404).send({ message: 'Usuário não encontrado' });
      }

      const userResponse: UserResponse = {
        name: user.name ?? '',
        email: user.email,
        phone: user.phone ?? '',
        createdAt: user.createdAt,
      };

      return await res.status(200).send({
        data: userResponse,
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(401).send({
          status: 401,
          msg: message,
        });
      }
    }
  });

  server.put('/delete-user', async (req, res): Promise<any> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return await res.status(401).send({ message: 'Token não fornecido' });
      }

      const [, token] = authHeader.split(' ');
      if (!token) {
        return await res.status(401).send({ message: 'Formato do header inválido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      const userId = decoded.id;

      await setUserAsInactive(userId);
      return await res.status(200).send({
        message: 'Usuário excluido com sucesso!',
      });
    } catch (err) {
      const { message } = err as Error;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(401).send({
          status: 401,
          msg: message,
        });
      }
    }
  });
};
