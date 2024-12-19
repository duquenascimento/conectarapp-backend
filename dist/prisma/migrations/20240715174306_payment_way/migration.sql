/*
  Warnings:

  - Added the required column `paymentWay` to the `restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "paymentWay" VARCHAR(200) NOT NULL;
