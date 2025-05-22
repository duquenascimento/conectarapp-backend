/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `restaurant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "appVersion" (
    "id" UUID NOT NULL,
    "externalId" VARCHAR(10) NOT NULL,
    "OperationalSystem" TEXT NOT NULL,
    "version" VARCHAR(10) NOT NULL,
    "statusId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "appVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appVersion_externalId_key" ON "appVersion"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_externalId_key" ON "restaurant"("externalId");

-- AddForeignKey
ALTER TABLE "appVersion" ADD CONSTRAINT "appVersion_externalId_fkey" FOREIGN KEY ("externalId") REFERENCES "restaurant"("externalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appVersion" ADD CONSTRAINT "appVersion_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
