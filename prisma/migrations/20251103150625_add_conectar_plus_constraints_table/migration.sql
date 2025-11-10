-- CreateTable
CREATE TABLE "conectar_plus_constraints" (
    "id" TEXT NOT NULL,
    "minTotalOrderValue" INTEGER NOT NULL,
    "minSupplierValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "conectar_plus_constraints_pkey" PRIMARY KEY ("id")
);
