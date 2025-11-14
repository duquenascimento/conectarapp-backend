-- CreateTable
CREATE TABLE "order_invoice" (
    "id" VARCHAR(50) NOT NULL,
    "orderId" TEXT NOT NULL,
    "filePath" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_invoice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_invoice" ADD CONSTRAINT "order_invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
