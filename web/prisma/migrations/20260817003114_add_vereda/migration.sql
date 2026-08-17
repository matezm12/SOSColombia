-- CreateEnum
CREATE TYPE "VeredaKind" AS ENUM ('VEREDA', 'CORREGIMIENTO', 'CENTRO_POBLADO');

-- AlterTable
ALTER TABLE "AidPoint" ADD COLUMN     "veredaId" TEXT;

-- AlterTable
ALTER TABLE "PendingAidPoint" ADD COLUMN     "veredaName" TEXT;

-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN     "veredaId" TEXT;

-- CreateTable
CREATE TABLE "Vereda" (
    "id" TEXT NOT NULL,
    "municipioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "codigoVereda" TEXT,
    "kind" "VeredaKind" NOT NULL DEFAULT 'VEREDA',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "sourceId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vereda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CrowdfundingCampaignToVereda" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CrowdfundingCampaignToVereda_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vereda_codigoVereda_key" ON "Vereda"("codigoVereda");

-- CreateIndex
CREATE INDEX "Vereda_municipioId_idx" ON "Vereda"("municipioId");

-- CreateIndex
CREATE UNIQUE INDEX "Vereda_municipioId_slug_key" ON "Vereda"("municipioId", "slug");

-- CreateIndex
CREATE INDEX "_CrowdfundingCampaignToVereda_B_index" ON "_CrowdfundingCampaignToVereda"("B");

-- CreateIndex
CREATE INDEX "AidPoint_veredaId_idx" ON "AidPoint"("veredaId");

-- AddForeignKey
ALTER TABLE "Vereda" ADD CONSTRAINT "Vereda_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vereda" ADD CONSTRAINT "Vereda_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPoint" ADD CONSTRAINT "AidPoint_veredaId_fkey" FOREIGN KEY ("veredaId") REFERENCES "Vereda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_veredaId_fkey" FOREIGN KEY ("veredaId") REFERENCES "Vereda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrowdfundingCampaignToVereda" ADD CONSTRAINT "_CrowdfundingCampaignToVereda_A_fkey" FOREIGN KEY ("A") REFERENCES "CrowdfundingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrowdfundingCampaignToVereda" ADD CONSTRAINT "_CrowdfundingCampaignToVereda_B_fkey" FOREIGN KEY ("B") REFERENCES "Vereda"("id") ON DELETE CASCADE ON UPDATE CASCADE;
