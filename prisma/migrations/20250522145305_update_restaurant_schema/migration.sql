-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "blockNewApp" BOOLEAN,
ALTER COLUMN "registrationReleasedNewApp" SET DEFAULT true;
