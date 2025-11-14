/*
  Warnings:

  - Added the required column `orderDocument` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "orderDocument" VARCHAR(1000) NOT NULL;
