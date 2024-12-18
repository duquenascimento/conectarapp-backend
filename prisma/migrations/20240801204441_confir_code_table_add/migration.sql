-- CreateTable
CREATE TABLE "confirmCode" (
    "id" UUID NOT NULL,
    "createdAt" DATE NOT NULL,
    "identifier" TEXT NOT NULL,

    CONSTRAINT "confirmCode_pkey" PRIMARY KEY ("id")
);
