-- CreateTable
CREATE TABLE "premiumOrder" (
    "id" UUID NOT NULL,
    "Date" DATE NOT NULL,
    "orderText" TEXT NOT NULL,
    "cart" JSON NOT NULL,
    "restaurantId" UUID NOT NULL,

    CONSTRAINT "premiumOrder_pkey" PRIMARY KEY ("id")
);
