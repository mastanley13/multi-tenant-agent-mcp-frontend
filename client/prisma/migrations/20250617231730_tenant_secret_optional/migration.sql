-- AlterTable
ALTER TABLE "TenantSecret" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "expiresAt" INTEGER,
ADD COLUMN     "ghlUserId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "userType" TEXT;
