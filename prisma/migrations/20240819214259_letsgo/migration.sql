/*
  Warnings:

  - Added the required column `externalId` to the `restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "externalId" VARCHAR(10) NOT NULL;

-- CreateTable
CREATE TABLE "clientCount" (
    "id" UUID NOT NULL,
    "externalId" SMALLINT NOT NULL,
    "createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientCount_pkey" PRIMARY KEY ("id")
);
