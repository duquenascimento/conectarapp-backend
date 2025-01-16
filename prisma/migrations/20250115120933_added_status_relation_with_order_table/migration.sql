/*
  Warnings:

  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "status",
ADD COLUMN     "status_id" INTEGER NOT NULL DEFAULT 4;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
