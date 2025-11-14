-- AlterTable
ALTER TABLE "restaurant" ALTER COLUMN "registrationReleasedNewApp" SET DEFAULT false;
-- Adicione isso ao arquivo SQL da migration (antes ou depois do ALTER COLUMN)
--UPDATE "restaurant" SET "registrationReleasedNewApp" = false;