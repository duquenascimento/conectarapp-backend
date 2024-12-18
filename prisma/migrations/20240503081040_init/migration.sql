-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(60),
    "active" BOOLEAN NOT NULL,
    "restaurant" UUID[],
    "role" UUID[],

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "user" UUID[],
    "address" UUID[],
    "favorite" UUID[],

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL,
    "restaurant" UUID[],
    "active" BOOLEAN NOT NULL,
    "address" VARCHAR(200) NOT NULL,
    "neighborhood" VARCHAR(200) NOT NULL,
    "initialDeliveryTime" TIME(6) NOT NULL,
    "finalDeliveryTime" TIME(6) NOT NULL,
    "deliveryInformation" VARCHAR(500) NOT NULL,
    "closedDoorDelivery" BOOLEAN NOT NULL,
    "responsibleReceivingName" VARCHAR(200) NOT NULL,
    "responsibleReceivingPhoneNumber" VARCHAR(50) NOT NULL,
    "zipCode" VARCHAR(10) NOT NULL,
    "deliveryReference" VARCHAR(500) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "permission" VARCHAR(1000) NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
