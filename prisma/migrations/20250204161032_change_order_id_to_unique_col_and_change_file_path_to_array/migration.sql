/*
  Warnings:

  - The `filePath` column on the `order_invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[orderId]` on the table `order_invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "order_invoice" DROP COLUMN "filePath",
ADD COLUMN     "filePath" VARCHAR(255)[];

-- CreateIndex
CREATE UNIQUE INDEX "order_invoice_orderId_key" ON "order_invoice"("orderId");
