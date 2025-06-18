-- CreateTable
CREATE TABLE "TenantSecret" (
    "tenantId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSecret_pkey" PRIMARY KEY ("tenantId")
);
