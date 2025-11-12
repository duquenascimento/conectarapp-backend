import { type user } from '@prisma/client';
import { logRegister } from '../utils/logUtils';
import userRepository from '../repository/userRepository';

export const findUserById = async (id?: string): Promise<user> => {
  try {
    const result = await userRepository.findById(id ?? '');
    if (result == null) throw new Error('not found', { cause: 'visibleError' });
    return result;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const softDeleteUser = async (id: string): Promise<void> => {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('not found', { cause: 'visibleError' });
    }
    await userRepository.softDeleteUser(id);
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

const userService = {
  findUserById,
  softDeleteUser,
};

export default userService;
