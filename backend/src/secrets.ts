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
    throw new Error(`TenantSecret not found for ${tenantId}`)
  }

  return {
    accessToken: secret.accessToken,
    locationId: secret.locationId,
  }
} 