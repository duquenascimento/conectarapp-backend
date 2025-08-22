/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,productId]` on the table `cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cart_restaurantId_productId_key" ON "cart"("restaurantId", "productId");
