/*
  Warnings:

  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE VARCHAR(500)[];

-- DropTable
DROP TABLE "role";
