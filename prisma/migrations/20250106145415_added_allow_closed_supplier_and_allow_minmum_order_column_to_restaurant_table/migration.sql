-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "allowClosedSupplier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowMinimumOrder" BOOLEAN NOT NULL DEFAULT false;
