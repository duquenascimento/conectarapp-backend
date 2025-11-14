-- CreateTable
CREATE TABLE "favorite" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);
