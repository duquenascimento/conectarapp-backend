/*
  Warnings:

  - You are about to alter the column `orderId` on the `order_invoice` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- DropForeignKey
ALTER TABLE "order_invoice" DROP CONSTRAINT "order_invoice_orderId_fkey";

-- AlterTable
ALTER TABLE "order_invoice" ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "orderId" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "premiumOrder" ADD COLUMN     "orderId" VARCHAR(50);
