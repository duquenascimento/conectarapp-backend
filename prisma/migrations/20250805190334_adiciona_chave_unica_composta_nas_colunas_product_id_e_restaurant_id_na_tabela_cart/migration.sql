/*
  Warnings:

  - You are about to alter the column `asaasCustomerId` on the `restaurant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - A unique constraint covering the columns `[restaurantId,productId]` on the table `cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,supplierId]` on the table `restaurant_supplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "restaurant" ALTER COLUMN "asaasCustomerId" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "cart_restaurantId_productId_key" ON "cart"("restaurantId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_supplier_restaurantId_supplierId_key" ON "restaurant_supplier"("restaurantId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_externalId_key" ON "supplier"("externalId");
