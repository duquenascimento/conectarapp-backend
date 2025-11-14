-- AlterTable
ALTER TABLE "favorite" ADD COLUMN     "obs" VARCHAR(200);

-- CreateTable
CREATE TABLE "cart" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "obs" VARCHAR(200),
    "amount" DECIMAL(65,30) NOT NULL,
    "restaurantId" UUID NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);
