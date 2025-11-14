/*
  Warnings:

  - You are about to drop the column `status` on the `order_invoice` table. All the data in the column will be lost.
  - Added the required column `status_id` to the `order_invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_invoice" DROP COLUMN "status",
ADD COLUMN     "status_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
