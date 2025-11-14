-- DropForeignKey
ALTER TABLE "appVersion" DROP CONSTRAINT "appVersion_statusId_fkey";

-- AlterTable
ALTER TABLE "appVersion" ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "appVersion" ADD CONSTRAINT "appVersion_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
