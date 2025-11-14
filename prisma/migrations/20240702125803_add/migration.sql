-- CreateTable
CREATE TABLE "order" (
    "id" VARCHAR(50) NOT NULL,
    "restaurantId" VARCHAR(20) NOT NULL,
    "addressId" UUID NOT NULL,
    "orderDate" DATE NOT NULL,
    "deliveryDate" DATE NOT NULL,
    "orderHour" TIME(6) NOT NULL,
    "paymentWay" VARCHAR(50) NOT NULL,
    "referencePoint" VARCHAR(200) NOT NULL,
    "initialDeliveryTime" TIME(6) NOT NULL,
    "finalDeliveryTime" TIME(6) NOT NULL,
    "totalSupplier" DECIMAL(10,2) NOT NULL,
    "totalConectar" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(100) NOT NULL,
    "detailing" VARCHAR(50)[],
    "tax" DECIMAL(10,5) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detailing" (
    "id" VARCHAR(50) NOT NULL,
    "orderId" VARCHAR(50) NOT NULL,
    "restaurantId" UUID NOT NULL,
    "productId" VARCHAR(50) NOT NULL,
    "orderAmount" DECIMAL(10,3) NOT NULL,
    "restaurantFinalAmount" DECIMAL(10,3) NOT NULL,
    "supplierFinalAmount" DECIMAL(10,3) NOT NULL,
    "obs" VARCHAR(250) NOT NULL,
    "supplierPricePerUnid" DECIMAL(10,2) NOT NULL,
    "conectarPricePerUnid" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(100) NOT NULL,
    "supplierFinalPrice" DECIMAL(10,2) NOT NULL,
    "conectarFinalPrice" DECIMAL(10,2) NOT NULL,
    "suppliersDetailing" JSON NOT NULL,

    CONSTRAINT "detailing_pkey" PRIMARY KEY ("id")
);
