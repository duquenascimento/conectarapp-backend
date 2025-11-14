-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "transactions_type_id" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_ways_id" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "value_paid" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMPTZ(3) NOT NULL,
    "status_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions_type" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "transactions_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_ways" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_ways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bolecode" (
    "id" SERIAL NOT NULL,
    "transactions_id" INTEGER NOT NULL,
    "public_id" VARCHAR(10),
    "status_id" INTEGER NOT NULL,
    "status_updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "codebar" TEXT,
    "digitable_line" TEXT,
    "value" DECIMAL(10,2) NOT NULL,
    "transaction_gateway_id" TEXT,
    "txId" TEXT,
    "pix_code" TEXT,
    "payer_gateway_id" TEXT,
    "store_gateway_id" TEXT,
    "application_gateway_id" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bolecode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transactions_type_id_fkey" FOREIGN KEY ("transactions_type_id") REFERENCES "transactions_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_ways_id_fkey" FOREIGN KEY ("payment_ways_id") REFERENCES "payment_ways"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bolecode" ADD CONSTRAINT "bolecode_transactions_id_fkey" FOREIGN KEY ("transactions_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bolecode" ADD CONSTRAINT "bolecode_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
