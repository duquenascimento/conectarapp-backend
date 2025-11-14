/*
  Warnings:

  - Made the column `asaasCustomerId` on table `restaurant_supplier` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "cart_restaurantId_productId_key";

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "orderTextGuru" VARCHAR(2000);

-- AlterTable
ALTER TABLE "restaurant_supplier" ALTER COLUMN "asaasCustomerId" SET NOT NULL;
