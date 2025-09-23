/*
  Warnings:

  - You are about to drop the column `createdAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cart" ALTER COLUMN "createdAt" SET DATA TYPE DATE,
ALTER COLUMN "updatedAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "conectarPlus" BOOLEAN NOT NULL DEFAULT false;
