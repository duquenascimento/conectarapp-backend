import { bolecode, payment_ways, PrismaClient, transactions, transactions_type } from "@prisma/client"
import { logRegister } from "../utils/logUtils"

const prisma = new PrismaClient()

export const saveTransaction = 
async (data: Omit<transactions, 'id' | 'createdAt' | 'updatedAt' | 'value_paid'>):Promise<Pick<transactions, 'id'> | undefined> => {
    try {
        return await prisma.transactions.create({
            data,
            select: { id: true }
        })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    }
}

export const saveBolecode =
async (data: Pick<bolecode, 'status_id' | 'value' | 'transactions_id' | 'public_id' | 'bolecode_id'>) => {
    try {
        return await prisma.bolecode.create({
            data,
            select: { id: true }
        })
    } catch (err) {
        updateTransaction({ status_id: 11 }, data.transactions_id)
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    }
}

export const updateTransaction = async (data: Partial<transactions>, id: number): Promise<void> => {
    try {
        await prisma.transactions.update({
            data,
            where: { id }
        })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    } 
}

export const updateBolecode = async (data: Partial<bolecode>, id: number): Promise<void> => {
    try {
        await prisma.bolecode.update({
            data,
            where: { id }
        })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    } 
}

export const findTransactionType = async (id: number): Promise<transactions_type | null | undefined> => {
    try {
        return await prisma.transactions_type.findUnique({ where: { id } })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    }
}

export const findPaymentWay = async (id: number): Promise<payment_ways | null | undefined> => {
    try {
        return await prisma.payment_ways.findUnique({ where: { id } })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    }
}