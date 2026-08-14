-- CreateTable
CREATE TABLE "PendingTollRecord" (
    "id" TEXT NOT NULL,
    "municipioId" TEXT,
    "departmentId" TEXT,
    "metric" "TollMetric",
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "asOf" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "sourceOrg" TEXT,
    "submitterNote" TEXT,
    "origin" "SubmissionOrigin" NOT NULL DEFAULT 'AUTOMATION_SWEEP',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "promotedTollRecordId" TEXT,

    CONSTRAINT "PendingTollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingTollRecord_status_idx" ON "PendingTollRecord"("status");

-- AddForeignKey
ALTER TABLE "PendingTollRecord" ADD CONSTRAINT "PendingTollRecord_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingTollRecord" ADD CONSTRAINT "PendingTollRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
