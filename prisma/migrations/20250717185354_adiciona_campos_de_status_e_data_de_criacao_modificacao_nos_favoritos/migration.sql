-- AlterTable
ALTER TABLE "favorite" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
