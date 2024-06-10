import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { type IFirstStepSignUp } from '../service/authService'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export interface IFindUserByEmail {
  id: string
  email: string
  active: boolean
  restaurant: string[]
  role: string[]
}
export const findUserByEmail = async (email: string): Promise<IFindUserByEmail | null> => {
  try {
    const result = await prisma.user.findUnique({
      where: {
        email
      },
      select: {
        email: true,
        active: true,
        id: true,
        restaurant: true,
        role: true
      }
    })
    await prisma.$disconnect()
    return result
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
    return null
  }
}

export const signInFirstStepUser = async (req: IFirstStepSignUp): Promise<void> => {
  try {
    await prisma.user.create({
      data: req
    })
    await prisma.$disconnect()
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  }
}
