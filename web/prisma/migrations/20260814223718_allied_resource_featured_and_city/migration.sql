-- AlterTable
ALTER TABLE "AlliedResource" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "municipioId" TEXT;

-- CreateIndex
CREATE INDEX "AlliedResource_municipioId_idx" ON "AlliedResource"("municipioId");

-- AddForeignKey
ALTER TABLE "AlliedResource" ADD CONSTRAINT "AlliedResource_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
