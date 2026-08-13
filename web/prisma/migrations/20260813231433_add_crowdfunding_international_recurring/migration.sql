-- AlterTable
ALTER TABLE "CrowdfundingCampaign" ADD COLUMN     "international" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false;
