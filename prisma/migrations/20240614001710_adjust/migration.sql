/*
  Warnings:

  - You are about to alter the column `amount` on the `cart` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE "cart" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,3);
