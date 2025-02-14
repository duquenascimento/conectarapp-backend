import { type order, PrismaClient } from '@prisma/client'
import { logRegister } from '../utils/logUtils'

const prisma = new PrismaClient()

export const findById = async (
  id: string
): Promise<order | null | undefined> => {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: { orderInvoices: true }
    })
  } catch (err) {
    void logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const cancelById = async (id: string): Promise<void> => {
  try {
    await prisma.order.update({ where: { id }, data: { status_id: 6 } })
  } catch (err) {
    void logRegister(err)
  } finally {
    await prisma.$disconnect()
  }
}

export const filterOrders = async (
  filters: Record<string, string>,
  page: number,
  limit: number
): Promise<{ data: order[], total: number }> => {
  try {
    const whereClause = Object.keys(filters).reduce<Record<string, any>>(
      (acc, key) => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (filters[key]) {
          acc[key] = { contains: filters[key], mode: 'insensitive' }
        }
        return acc
      },
      {}
    )

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: { orderInvoices: true }
      }),
      prisma.order.count({ where: whereClause })
    ])

    return {
      data: orders.map((order) => ({
        ...order,
        totalSupplier: order.totalSupplier.toNumber(),
        totalConectar: order.totalConectar.toNumber(),
        tax: order.tax.toNumber()
      })) as unknown as order[],
      total
    }
  } catch (err: any) {
    await logRegister(err)
    return { data: [], total: 0 }
  } finally {
    await prisma.$disconnect()
  }
}
