-- AlterTable
ALTER TABLE "supplier" ADD COLUMN     "status_id" INTEGER NOT NULL DEFAULT 6;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
