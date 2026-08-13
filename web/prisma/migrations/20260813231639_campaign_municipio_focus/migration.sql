-- CreateTable
CREATE TABLE "_CrowdfundingCampaignToMunicipio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CrowdfundingCampaignToMunicipio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CrowdfundingCampaignToMunicipio_B_index" ON "_CrowdfundingCampaignToMunicipio"("B");

-- AddForeignKey
ALTER TABLE "_CrowdfundingCampaignToMunicipio" ADD CONSTRAINT "_CrowdfundingCampaignToMunicipio_A_fkey" FOREIGN KEY ("A") REFERENCES "CrowdfundingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CrowdfundingCampaignToMunicipio" ADD CONSTRAINT "_CrowdfundingCampaignToMunicipio_B_fkey" FOREIGN KEY ("B") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
