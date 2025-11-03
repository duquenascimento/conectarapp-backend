-- AlterTable
ALTER TABLE "supplier" ADD COLUMN     "referral_restaurant_id" UUID;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_referral_restaurant_id_fkey" FOREIGN KEY ("referral_restaurant_id") REFERENCES "restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
