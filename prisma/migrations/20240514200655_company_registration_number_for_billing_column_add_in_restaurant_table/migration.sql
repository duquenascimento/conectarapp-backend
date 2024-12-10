/*
  Warnings:

  - Added the required column `CompanyRegistrationNumberForBilling` to the `restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "CompanyRegistrationNumberForBilling" VARCHAR(14) NOT NULL;
