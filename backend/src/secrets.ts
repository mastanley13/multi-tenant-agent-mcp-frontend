import { prisma } from './prisma'

export interface TenantSecrets {
  accessToken: string
  refreshToken?: string
  expiresAt?: number | null
  locationId: string
  companyId?: string | null
  ghlUserId?: string | null
  userType?: string | null
}

/**
 * Retrieve the stored OAuth credentials for a given tenant.
 * Throws an Error if the tenant row does not exist.
 */
export async function getTenantSecrets(tenantId: string): Promise<TenantSecrets> {
  const secret = await prisma.tenantSecret.findUnique({ where: { tenantId } })

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      return {
        accessToken: 'stub-token',
        locationId: 'stub-loc',
      }
    }

    // Fallback: look for OAuth account row to bootstrap TenantSecret
    const account = await prisma.account.findFirst({
      where: {
        provider: 'oauth',
        OR: [
          { userId: tenantId },
          { providerAccountId: tenantId },
        ],
      },
    })

    if (account?.access_token && account.locationId) {
      // Create TenantSecret row for future use
      await prisma.tenantSecret.create({
        data: {
          tenantId,
          accessToken: account.access_token,
          refreshToken: account.refresh_token ?? undefined,
          expiresAt: account.expires_at ?? undefined,
          locationId: account.locationId,
          companyId: account.companyId ?? undefined,
          ghlUserId: account.providerAccountId ?? undefined,
          userType: account.userType ?? undefined,
        },
      })

      return {
        accessToken: account.access_token,
        locationId: account.locationId,
      }
    }

    throw new Error(`TenantSecret not found for ${tenantId}`)
  }

  return {
    accessToken: secret.accessToken,
    locationId: secret.locationId,
  }
} 