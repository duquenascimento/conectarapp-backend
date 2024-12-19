/*
  Warnings:

  - Added the required column `calcOrderAgain` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "calcOrderAgain" JSON NOT NULL;
