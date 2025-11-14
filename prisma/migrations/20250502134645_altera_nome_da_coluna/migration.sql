/*
  Warnings:

  - You are about to drop the column `blockNewApp` on the `restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "restaurant" DROP COLUMN "blockNewApp",
ADD COLUMN     "registrationReleasedNewApp" BOOLEAN NOT NULL DEFAULT true;
