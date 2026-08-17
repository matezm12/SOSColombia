-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredNote" TEXT;

-- CreateIndex
CREATE INDEX "SocialPost_municipioId_idx" ON "SocialPost"("municipioId");

-- CreateIndex
CREATE INDEX "SocialPost_veredaId_idx" ON "SocialPost"("veredaId");
