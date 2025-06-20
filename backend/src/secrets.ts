import { prisma } from './prisma'
import { logger } from './logger'

// Placeholder for environment variables.
// In a real app, these should be loaded from a secure vault or .env file.
const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID || '6849c89fc460116eab170d5d-mbv0qnjb';
const GHL_CLIENT_SECRET = process.env.GHL_CLIENT_SECRET || '577ce68b-7534-4d81-a5eb-227685647529';

interface GhlTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  // ... other properties from GHL ...
}

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
 * Refreshes the GHL access token using the refresh token.
 * Updates the database with the new token and expiry.
 */
async function refreshAccessToken(tenantId: string, refreshToken: string): Promise<TenantSecrets> {
  logger.info(`Refreshing access token for tenant ${tenantId}`);

  const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: GHL_CLIENT_ID,
      client_secret: GHL_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      user_type: 'Location',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error(`Failed to refresh GHL token for tenant ${tenantId}. Status: ${response.status}, Body: ${errorBody}`);
    throw new Error('Failed to refresh GHL access token.');
  }

  const newTokens = await response.json() as GhlTokenResponse;

  // expires_in is in seconds, convert to a future timestamp
  const expiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in;

  // Update the TenantSecret in the database with the new credentials
  const updatedSecret = await prisma.tenantSecret.update({
    where: { tenantId },
    data: {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token, // GHL may return a new refresh token
      expiresAt: expiresAt,
    },
  });
  
  logger.info(`Successfully refreshed access token for tenant ${tenantId}`);

  return {
    accessToken: updatedSecret.accessToken,
    refreshToken: updatedSecret.refreshToken ?? undefined,
    expiresAt: updatedSecret.expiresAt,
    locationId: updatedSecret.locationId,
    companyId: updatedSecret.companyId,
    ghlUserId: updatedSecret.ghlUserId,
    userType: updatedSecret.userType,
  };
}

/**
 * Retrieve the stored OAuth credentials for a given tenant.
 * Throws an Error if the tenant row does not exist.
 */
export async function getTenantSecrets(tenantId: string): Promise<TenantSecrets> {
  const secret = await prisma.tenantSecret.findUnique({ where: { tenantId } })

  if (secret) {
    // Check if the token is expired or will expire in the next 5 minutes
    const fiveMinutesFromNow = Math.floor(Date.now() / 1000) + 300;
    if (secret.expiresAt && secret.expiresAt < fiveMinutesFromNow) {
      if (secret.refreshToken) {
        return refreshAccessToken(tenantId, secret.refreshToken);
      } else {
        logger.warn(`Token for tenant ${tenantId} is expired, but no refresh token is available.`);
        // Fall through to return the expired token, let the API call fail
      }
    }
    return {
      accessToken: secret.accessToken,
      refreshToken: secret.refreshToken ?? undefined,
      expiresAt: secret.expiresAt,
      locationId: secret.locationId,
      companyId: secret.companyId,
      ghlUserId: secret.ghlUserId,
      userType: secret.userType,
    };
  }

  // --- Handle case where TenantSecret does not exist ---

  // Fallback: look for OAuth account row to bootstrap TenantSecret
  const account = await prisma.account.findFirst({
    where: {
      provider: 'go-high-level', // Correct provider name
      OR: [
        { userId: tenantId },
        { providerAccountId: tenantId },
      ],
    },
  })

  if (account?.access_token && account.locationId) {
    // Create TenantSecret row for future use
    const newSecret = await prisma.tenantSecret.create({
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
      accessToken: newSecret.accessToken,
      refreshToken: newSecret.refreshToken ?? undefined,
      expiresAt: newSecret.expiresAt,
      locationId: newSecret.locationId,
      companyId: newSecret.companyId,
      ghlUserId: newSecret.ghlUserId,
      userType: newSecret.userType,
    }
  }

  throw new Error(`TenantSecret not found for ${tenantId}`)
} 