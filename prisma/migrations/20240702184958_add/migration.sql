/*
  Warnings:

  - Added the required column `supplierId` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "supplierId" VARCHAR(50) NOT NULL;
