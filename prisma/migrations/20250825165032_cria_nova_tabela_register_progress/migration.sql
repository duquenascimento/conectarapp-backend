-- CreateTable
CREATE TABLE "register_progress" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "step" INTEGER NOT NULL,
    "values" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "register_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "register_progress_userId_key" ON "register_progress"("userId");

-- AddForeignKey
ALTER TABLE "register_progress" ADD CONSTRAINT "register_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
