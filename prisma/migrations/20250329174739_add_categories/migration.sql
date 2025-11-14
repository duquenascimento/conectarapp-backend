-- AlterTable
ALTER TABLE "restaurant" ADD COLUMN     "categories" TEXT[];

-- CreateTable
CREATE TABLE "Categories" (
    "id" UUID NOT NULL,
    "category" TEXT[],

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);
