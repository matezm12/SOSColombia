-- CreateEnum
CREATE TYPE "SubmissionOrigin" AS ENUM ('COMMUNITY', 'AUTOMATION_SWEEP');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PendingAidPoint" (
    "id" TEXT NOT NULL,
    "municipioId" TEXT NOT NULL,
    "kind" "AidPointKind" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "needsText" TEXT,
    "accessRestriction" TEXT,
    "sourceUrl" TEXT,
    "submitterNote" TEXT,
    "submitterContact" TEXT,
    "origin" "SubmissionOrigin" NOT NULL DEFAULT 'COMMUNITY',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "promotedAidPointId" TEXT,

    CONSTRAINT "PendingAidPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingAidPoint_status_idx" ON "PendingAidPoint"("status");

-- AddForeignKey
ALTER TABLE "PendingAidPoint" ADD CONSTRAINT "PendingAidPoint_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
