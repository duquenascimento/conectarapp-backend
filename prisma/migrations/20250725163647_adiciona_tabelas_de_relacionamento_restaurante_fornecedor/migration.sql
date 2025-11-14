ALTER TABLE "restaurant" ADD COLUMN "asaasCustomerId" TEXT;

-- CreateTable
CREATE TABLE "supplier" (
    "id" UUID NOT NULL,
    "externalId" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "asaasApiToken" VARCHAR(255) NOT NULL,
    "asaasWalletId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_supplier" (
    "id" UUID NOT NULL,
    "restaurantId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "restaurant_supplier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "restaurant_supplier"
ADD CONSTRAINT "restaurant_supplier_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_supplier"
ADD CONSTRAINT "restaurant_supplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;