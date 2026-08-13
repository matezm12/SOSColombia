-- CreateEnum
CREATE TYPE "SeverityLabel" AS ENUM ('CRITICA', 'ALTA', 'MODERADA', 'LEVE');

-- CreateEnum
CREATE TYPE "TollMetric" AS ENUM ('DEATHS_REPORTED_OFFICIAL', 'DEATHS_CONFIRMED_FORENSIC', 'INJURED', 'MISSING_OFFICIAL', 'MISSING_CROWDSOURCED', 'DAMNIFICADOS_PERSONAS', 'DAMNIFICADOS_FAMILIAS', 'VIVIENDAS_DESTRUIDAS', 'VIVIENDAS_AVERIADAS', 'EDIFICIOS_COLAPSADOS', 'CENTROS_EDUCATIVOS_AFECTADOS', 'CENTROS_COMUNITARIOS_AFECTADOS', 'CENTROS_SALUD_AFECTADOS');

-- CreateEnum
CREATE TYPE "AidPointKind" AS ENUM ('ALBERGUE', 'ACOPIO', 'HEALTH', 'VET', 'BLOOD_DONATION', 'MONETARY_DONATION');

-- CreateEnum
CREATE TYPE "AidPointStatus" AS ENUM ('ACTIVE', 'FULL', 'CLOSED', 'UNCONFIRMED');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('LIVE', 'BLOCKED', 'DEAD', 'NEEDS_RECHECK');

-- CreateEnum
CREATE TYPE "ContradictionStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "CrowdfundingPlatform" AS ENUM ('GOFUNDME', 'VAKI', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'PLAUSIBLE', 'UNCONFIRMED', 'FLAGGED_SCAM');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('X', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK');

-- CreateEnum
CREATE TYPE "SocialPostCategory" AS ENUM ('AID_POINT', 'NEED', 'HUMAN_INTEREST', 'OFFICIAL');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "magnitudeSgc" DOUBLE PRECISION,
    "magnitudeUsgs" DOUBLE PRECISION,
    "depthSgcKm" DOUBLE PRECISION,
    "depthUsgsKm" DOUBLE PRECISION,
    "epicenterLatSgc" DOUBLE PRECISION,
    "epicenterLngSgc" DOUBLE PRECISION,
    "epicenterLatUsgs" DOUBLE PRECISION,
    "epicenterLngUsgs" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divipolaCode" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "divipolaCode" TEXT NOT NULL,
    "populationDane" INTEGER,
    "populationAsOf" TIMESTAMP(3),
    "severityLabel" "SeverityLabel",
    "redAlert" BOOLEAN NOT NULL DEFAULT false,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TollRecord" (
    "id" TEXT NOT NULL,
    "municipioId" TEXT,
    "departmentId" TEXT,
    "metric" "TollMetric" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "sourceId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "TollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidPoint" (
    "id" TEXT NOT NULL,
    "municipioId" TEXT NOT NULL,
    "kind" "AidPointKind" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "needsText" TEXT,
    "status" "AidPointStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "accessRestriction" TEXT,
    "sourceId" TEXT NOT NULL,
    "permalink" TEXT,
    "lastVerifiedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AidPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovReport" (
    "id" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "keyFigures" JSONB,
    "summary" TEXT NOT NULL,
    "sourceTier" INTEGER NOT NULL,

    CONSTRAINT "GovReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'LIVE',
    "lastFetchedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contradiction" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "status" "ContradictionStatus" NOT NULL DEFAULT 'OPEN',
    "valueA" TEXT NOT NULL,
    "sourceA" TEXT NOT NULL,
    "valueB" TEXT NOT NULL,
    "sourceB" TEXT NOT NULL,
    "resolutionText" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Contradiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrowdfundingCampaign" (
    "id" TEXT NOT NULL,
    "platform" "CrowdfundingPlatform" NOT NULL,
    "title" TEXT NOT NULL,
    "orgOrPerson" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "goal" DOUBLE PRECISION,
    "raised" DOUBLE PRECISION,
    "donorCount" INTEGER,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrowdfundingCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "permalink" TEXT NOT NULL,
    "authorHandle" TEXT,
    "oembedHtml" TEXT,
    "municipioId" TEXT,
    "category" "SocialPostCategory" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_divipolaCode_key" ON "Department"("divipolaCode");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_divipolaCode_key" ON "Municipio"("divipolaCode");

-- CreateIndex
CREATE INDEX "Municipio_departmentId_idx" ON "Municipio"("departmentId");

-- CreateIndex
CREATE INDEX "TollRecord_municipioId_metric_idx" ON "TollRecord"("municipioId", "metric");

-- CreateIndex
CREATE INDEX "TollRecord_departmentId_metric_idx" ON "TollRecord"("departmentId", "metric");

-- CreateIndex
CREATE INDEX "AidPoint_municipioId_kind_idx" ON "AidPoint"("municipioId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_permalink_key" ON "SocialPost"("permalink");

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TollRecord" ADD CONSTRAINT "TollRecord_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TollRecord" ADD CONSTRAINT "TollRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TollRecord" ADD CONSTRAINT "TollRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPoint" ADD CONSTRAINT "AidPoint_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AidPoint" ADD CONSTRAINT "AidPoint_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
