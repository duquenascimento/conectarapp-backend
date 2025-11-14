/*
  Warnings:

  - You are about to drop the column `CompanyRegistrationNumberForBilling` on the `restaurant` table. All the data in the column will be lost.
  - Added the required column `companyRegistrationNumberForBilling` to the `restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restaurant" DROP COLUMN "CompanyRegistrationNumberForBilling",
ADD COLUMN     "companyRegistrationNumberForBilling" VARCHAR(14) NOT NULL;
