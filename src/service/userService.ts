import { type user } from '@prisma/client';
import { findById, softDeleteUser } from '../repository/userRepository';
import { logRegister } from '../utils/logUtils';

export const findUserById = async (id?: string): Promise<user> => {
  try {
    const result = await findById(id ?? '');
    if (result == null) throw new Error('not found', { cause: 'visibleError' });
    return result;
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};

export const setUserAsInactive = async (id: string): Promise<void> => {
  try {
    const user = await findById(id);
    if (!user) {
      throw new Error('not found', { cause: 'visibleError' });
    }
    await softDeleteUser(id);
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err);
    throw Error((err as Error).message);
  }
};
