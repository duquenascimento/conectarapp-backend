/*
  Warnings:

  - Added the required column `alternativeEmail` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alternativePhone` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closeDoor` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalName` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderValue` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weeklyOrderAmount` to the `restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "alternativeEmail" TEXT NOT NULL,
ADD COLUMN     "alternativePhone" TEXT NOT NULL,
ADD COLUMN     "cityRegistrationNumber" VARCHAR,
ADD COLUMN     "closeDoor" BOOLEAN NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "legalName" VARCHAR NOT NULL,
ADD COLUMN     "orderValue" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "weeklyOrderAmount" SMALLINT NOT NULL;
