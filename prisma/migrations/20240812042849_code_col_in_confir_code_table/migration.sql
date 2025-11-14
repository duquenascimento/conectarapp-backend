/*
  Warnings:

  - Added the required column `code` to the `confirmCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "confirmCode" ADD COLUMN     "code" TEXT NOT NULL;
