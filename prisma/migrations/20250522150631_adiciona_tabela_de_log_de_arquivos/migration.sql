-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('SUCCESS', 'FAIL');

-- CreateTable
CREATE TABLE "file_log" (
    "id" VARCHAR(50) NOT NULL,
    "fileUrl" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100),
    "message" TEXT,
    "status" "LogStatus" NOT NULL DEFAULT 'SUCCESS',
    "httpStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_log_pkey" PRIMARY KEY ("id")
);
