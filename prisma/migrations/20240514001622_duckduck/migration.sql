/*
  Warnings:

  - Added the required column `createdAt` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyRegistrationNumber` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "createdAt" DATE NOT NULL,
ADD COLUMN     "updatedAt" DATE;

-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "companyRegistrationNumber" VARCHAR(14) NOT NULL,
ADD COLUMN     "createdAt" DATE NOT NULL,
ADD COLUMN     "stateRegistrationNumber" VARCHAR,
ADD COLUMN     "updatedAt" DATE;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "createdAt" DATE NOT NULL,
ADD COLUMN     "updatedAt" DATE;
