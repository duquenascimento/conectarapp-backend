import { PrismaClient, status } from "@prisma/client"
import { logRegister } from "../utils/logUtils"

const prisma = new PrismaClient()

export const findStatus = async (id: number): Promise<status | null | undefined> => {
    try {
        return await prisma.status.findUnique({ where: { id } })
    } catch (err) {
        logRegister(err)
    } finally {
        await prisma.$disconnect()
    }
}