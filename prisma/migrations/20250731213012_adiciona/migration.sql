/*
Warnings:

- You are about to alter the column `asaasCustomerId` on the `restaurant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
- A unique constraint covering the columns `[restaurantId,supplierId]` on the table `restaurant_supplier` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[externalId]` on the table `supplier` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterTable
ALTER TABLE "restaurant_supplier"
ADD COLUMN "asaasCustomerId" VARCHAR(50);