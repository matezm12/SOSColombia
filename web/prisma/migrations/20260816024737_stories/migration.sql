-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "ledeEs" TEXT NOT NULL,
    "ledeEn" TEXT NOT NULL,
    "bodyEs" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "authorName" TEXT NOT NULL,
    "municipioId" TEXT,
    "campaignId" TEXT,
    "socialPostId" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_status_publishedAt_idx" ON "Story"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Story_municipioId_idx" ON "Story"("municipioId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CrowdfundingCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
