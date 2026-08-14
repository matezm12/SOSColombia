-- CreateEnum
CREATE TYPE "AlliedResourceCategory" AS ENUM ('MAP_TRACKER', 'AID_DIRECTORY', 'DONATION_PLATFORM', 'NEWS_AGGREGATOR', 'VOLUNTEER_COORDINATION', 'OTHER');

-- CreateTable
CREATE TABLE "PendingSocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "permalink" TEXT NOT NULL,
    "authorHandle" TEXT,
    "category" "SocialPostCategory" NOT NULL,
    "municipioId" TEXT,
    "placeName" TEXT,
    "submitterNote" TEXT,
    "submitterContact" TEXT,
    "origin" "SubmissionOrigin" NOT NULL DEFAULT 'COMMUNITY',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "promotedSocialPostId" TEXT,

    CONSTRAINT "PendingSocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlliedResource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "org" TEXT,
    "description" TEXT NOT NULL,
    "category" "AlliedResourceCategory" NOT NULL,
    "hostingNoCustomDomain" BOOLEAN NOT NULL DEFAULT false,
    "ogImageUrl" TEXT,
    "tier" INTEGER NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'LIVE',
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "AlliedResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingSocialPost_status_idx" ON "PendingSocialPost"("status");

-- AddForeignKey
ALTER TABLE "PendingSocialPost" ADD CONSTRAINT "PendingSocialPost_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
