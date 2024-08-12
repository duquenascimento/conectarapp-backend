import { type confirmCode, PrismaClient } from '@prisma/client'
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
  password: string | null
  createdAt: Date
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
        role: true,
        password: true,
        createdAt: true
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

export const createCode = async (data: { createdAt: Date, identifier: string, id: string, code: string }): Promise<void> => {
  try {
    await prisma.confirmCode.deleteMany({
      where: {
        identifier: data.identifier
      }
    })
    await prisma.confirmCode.create({
      data
    })
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const checkCode = async (data: { identifier: string }): Promise<confirmCode | undefined | null> => {
  try {
    return await prisma.confirmCode.findFirst({
      where: {
        identifier: data.identifier
      }
    })
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const changePassword = async (data: { email: string, password: string }): Promise<void> => {
  try {
    await prisma.user.update({
      where: {
        email: data.email
      },
      data: {
        password: data.password
      }
    })
  } catch (err: any) {
    await prisma.$disconnect()
    await logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}
