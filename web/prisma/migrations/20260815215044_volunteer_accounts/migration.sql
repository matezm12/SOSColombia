-- AlterTable
ALTER TABLE "PendingAidPoint" ADD COLUMN     "reviewedByVolunteerId" TEXT;

-- AlterTable
ALTER TABLE "PendingSocialPost" ADD COLUMN     "reviewedByVolunteerId" TEXT;

-- AlterTable
ALTER TABLE "PendingTollRecord" ADD COLUMN     "reviewedByVolunteerId" TEXT;

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "canModeracion" BOOLEAN NOT NULL DEFAULT false,
    "canComunidad" BOOLEAN NOT NULL DEFAULT false,
    "canBoletines" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_username_key" ON "Volunteer"("username");

-- AddForeignKey
ALTER TABLE "PendingTollRecord" ADD CONSTRAINT "PendingTollRecord_reviewedByVolunteerId_fkey" FOREIGN KEY ("reviewedByVolunteerId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingAidPoint" ADD CONSTRAINT "PendingAidPoint_reviewedByVolunteerId_fkey" FOREIGN KEY ("reviewedByVolunteerId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingSocialPost" ADD CONSTRAINT "PendingSocialPost_reviewedByVolunteerId_fkey" FOREIGN KEY ("reviewedByVolunteerId") REFERENCES "Volunteer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
