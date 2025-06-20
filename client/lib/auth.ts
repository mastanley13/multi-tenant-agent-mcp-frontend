import axios from 'axios'
import { prisma } from './prisma'
import { NextAuthOptions, User } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope?: string
  userType?: string
  locationId?: string
  companyId?: string
  approvedLocations?: string[]
  userId?: string
  planId?: string
}

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    async createUser(user: any) {
      // CORRECT FIX: Use actual GHL userId for user identity
      const actualUserId = user.ghlUserId || user.id
      
      console.log('[AUTH DEBUG] Creating user with actual GHL userId:', actualUserId, 'for location:', user.locationId)
      
      return await prisma.user.create({
        data: {
          id: actualUserId,
          name: user.name || 'GoHighLevel User',
          email: user.email,
          image: user.image,
          locationId: user.locationId, // Current location context
        },
      })
    },
  },
  providers: [
    {
      id: "oauth",
      name: "GoHighLevel",
      type: "oauth",
      authorization: {
        url: "https://marketplace.leadconnectorhq.com/oauth/chooselocation",
        params: {
          response_type: "code",
          scope: "businesses.write calendars.readonly calendars.write blogs/list.readonly socialplanner/tag.write socialplanner/category.write blogs/posts.readonly custom-menu-link.write blogs/author.readonly custom-menu-link.readonly blogs/category.readonly businesses.readonly companies.readonly calendars/events.readonly calendars/events.write calendars/groups.readonly calendars/groups.write calendars/resources.readonly calendars/resources.write conversations.readonly campaigns.readonly conversations.write conversations/message.readonly conversations/message.write conversations/reports.readonly conversations/livechat.write contacts.readonly contacts.write objects/schema.readonly objects/schema.write objects/record.readonly objects/record.write associations.write associations.readonly associations/relation.readonly associations/relation.write courses.write courses.readonly forms.readonly forms.write invoices.readonly invoices.write invoices/schedule.readonly invoices/schedule.write invoices/template.readonly invoices/template.write invoices/estimate.readonly invoices/estimate.write links.readonly lc-email.readonly links.write locations.write locations.readonly locations/customValues.readonly locations/customValues.write locations/customFields.readonly locations/customFields.write locations/tasks.write locations/tasks.readonly locations/tags.write locations/tags.readonly medias.readonly locations/templates.readonly medias.write funnels/redirect.readonly funnels/page.readonly funnels/funnel.readonly funnels/pagecount.readonly funnels/redirect.write oauth.write oauth.readonly opportunities.readonly payments/orders.readonly opportunities.write payments/orders.write payments/integration.readonly payments/integration.write payments/transactions.readonly payments/subscriptions.readonly payments/coupons.readonly payments/coupons.write payments/custom-provider.readonly payments/custom-provider.write products.readonly products.write products/prices.readonly products/prices.write products/collection.readonly saas/company.read products/collection.write saas/company.write saas/location.read saas/location.write snapshots.readonly snapshots.write socialplanner/oauth.readonly socialplanner/oauth.write socialplanner/post.readonly socialplanner/post.write socialplanner/account.readonly socialplanner/account.write socialplanner/csv.readonly socialplanner/category.readonly socialplanner/csv.write store/shipping.readonly socialplanner/tag.readonly store/shipping.write store/setting.readonly store/setting.write surveys.readonly users.readonly users.write workflows.readonly emails/builder.write emails/builder.readonly emails/schedule.readonly wordpress.site.readonly blogs/post.write blogs/post-update.write blogs/check-slug.readonly",
          user_type: "Location"
        }
      },
      token: {
        url: "https://services.leadconnectorhq.com/oauth/token",
        async request(context) {
          const { provider, params, checks, client } = context
          
          console.log('[AUTH DEBUG] Token request params:', params)
          
          const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: provider.clientId!,
            client_secret: provider.clientSecret!,
            code: params.code!,
            redirect_uri: (params.redirect_uri as string) || `${process.env.NEXTAUTH_URL}/api/auth/callback/oauth`,
            user_type: "Location"
          })

          const response = await fetch("https://services.leadconnectorhq.com/oauth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          })

          if (!response.ok) {
            const errorData = await response.text()
            console.error("Token request failed:", response.status, errorData)
            throw new Error(`Token request failed: ${response.status}`)
          }

          const tokens = await response.json()
          console.log('[AUTH DEBUG] Token response:', tokens)
          
          return {
            tokens: {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
              token_type: tokens.token_type || "Bearer",
              scope: tokens.scope,
              // Map GHL specific fields for NextAuth
              locationId: tokens.locationId,
              companyId: tokens.companyId,
              userId: tokens.userId, // Actual GHL userId (the person)
              planId: tokens.planId,
              userType: tokens.userType,
              approvedLocations: tokens.approvedLocations
            }
          }
        }
      },
      userinfo: {
        async request(context) {
          // Extract user info from the token response
          const locationId = context.tokens.locationId as string
          const actualUserId = context.tokens.userId as string
          
          console.log('[AUTH DEBUG] Userinfo - actualUserId:', actualUserId, 'locationId:', locationId)
          
          return {
            sub: actualUserId, // Use actual GHL userId
            name: 'GoHighLevel User',
            email: undefined,
            locationId: locationId,
            ghlUserId: actualUserId,
          }
        }
      },
      clientId: process.env.GHL_CLIENT_ID,
      clientSecret: process.env.GHL_CLIENT_SECRET,
      profile(profile, tokens) {
        // Use actual GHL userId for user identity
        const actualUserId = tokens.userId || profile.ghlUserId || profile.sub
        
        console.log('[AUTH DEBUG] Profile mapping - actualUserId:', actualUserId, 'locationId:', tokens.locationId)
        
        return {
          id: actualUserId,
          name: profile.name || 'GoHighLevel User',
          email: profile.email,
          image: null,
          locationId: profile.locationId || tokens.locationId,
          ghlUserId: actualUserId,
        }
      },
      // Configure OAuth client settings
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      console.log('[AUTH DEBUG] JWT callback:', { token, account, profile, user })
      
      // Store OAuth tokens and GoHighLevel specific data
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.locationId = account.locationId
        token.companyId = account.companyId
        token.ghlUserId = account.userId // Actual GHL userId
        token.planId = account.planId
        token.userType = account.userType
        token.approvedLocations = account.approvedLocations
        
        // CRITICAL FIX: Override sub to use actual GHL userId for consistency
        token.sub = account.userId || user?.id
      }
      
      return token
    },
    async session({ session, token }) {
      console.log('[AUTH DEBUG] Session callback:', { session, token })
      
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.locationId = token.locationId as string
      session.companyId = token.companyId as string
      session.planId = token.planId as string
      session.userType = token.userType as string
      session.approvedLocations = (token.approvedLocations as string[]) || []
      
      // CRITICAL FIX: Use actual GHL userId, not the legacy sub
      session.user.id = token.ghlUserId as string || token.sub as string
      
      return session
    },
    async signIn({ account, profile, user }) {
      console.log('[AUTH DEBUG] SignIn callback:', { account, profile, user })
      
      if (account?.provider === "oauth") {
        try {          
          // --- CRITICAL FIX: Create TenantSecret per LOCATION, not per USER ---
          try {
            if (account.access_token && account.locationId) {
              // TENANT = LOCATION (sub-account)
              const tenantId = account.locationId
              
              console.log('[AUTH DEBUG] Creating TenantSecret for TENANT (location):', tenantId, 'accessed by user:', user.id)
              
              await prisma.tenantSecret.upsert({
                where: { tenantId },
                update: {
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token ?? undefined,
                  expiresAt: account.expires_at ?? undefined,
                  locationId: account.locationId,
                  companyId: account.companyId ?? undefined,
                  ghlUserId: account.userId ?? undefined, // For reference, but tenant is the location
                  userType: account.userType ?? undefined,
                },
                create: {
                  tenantId, // tenantId = locationId (the sub-account)
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token ?? undefined,
                  expiresAt: account.expires_at ?? undefined,
                  locationId: account.locationId,
                  companyId: account.companyId ?? undefined,
                  ghlUserId: account.userId ?? undefined,
                  userType: account.userType ?? undefined,
                },
              })
              console.log('[AUTH DEBUG] TenantSecret upserted for location/tenant:', tenantId)
            }
          } catch (err) {
            console.error('Failed to upsert TenantSecret:', err)
          }
          
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH DEBUG] SignIn event:', { user, account, profile })
      
      if (account?.provider === "oauth" && account.access_token) {
        // Store the complete token information in database
        try {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              locationId: account.locationId,
              companyId: account.companyId,
              userType: account.userType,
            },
            create: {
              userId: user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              locationId: account.locationId,
              companyId: account.companyId,
              userType: account.userType,
            },
          })
          
          console.log('[AUTH DEBUG] Account stored successfully')
        } catch (error) {
          console.error('Error storing account data:', error)
        }
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
}

export async function getValidToken(userId: string): Promise<string | null> {
  try {
    console.log('[AUTH DEBUG] getValidToken called with userId:', userId)
    
    // Get the user's account - first try direct userId lookup
    let account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'oauth'
      }
    })

    // If not found, try looking by providerAccountId (in case userId is actually the GHL user ID)
    if (!account) {
      console.log('[AUTH DEBUG] No account found for userId, trying providerAccountId lookup')
      account = await prisma.account.findFirst({
        where: {
          providerAccountId: userId,
          provider: 'oauth'
        }
      })
    }

    console.log('[AUTH DEBUG] Account found:', account ? 'YES' : 'NO', account?.userId)

    if (!account?.access_token) {
      throw new Error('No access token found')
    }

    // Check if token is still valid (with 5-minute buffer)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = account.expires_at || 0
    const buffer = 5 * 60 // 5 minutes

    if (expiresAt > now + buffer) {
      console.log('[AUTH DEBUG] Token is still valid')
      return account.access_token
    }

    console.log('[AUTH DEBUG] Token expired, attempting refresh')

    // Token is expired or about to expire, refresh it
    if (!account.refresh_token) {
      throw new Error('No refresh token available')
    }

    // FIXED: Proper token refresh request format
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
      client_id: process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
      user_type: 'Location'
    })

    const response = await axios.post<TokenResponse>(
      'https://services.leadconnectorhq.com/oauth/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const { access_token, refresh_token, expires_in } = response.data
    const newExpiresAt = Math.floor(Date.now() / 1000) + expires_in

    // Update the account with new tokens
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token,
        refresh_token: refresh_token || account.refresh_token, // Keep old refresh token if new one not provided
        expires_at: newExpiresAt,
      },
    })

    console.log('[AUTH DEBUG] Token refreshed successfully')

    // ----------------- A-5: Sync token refresh into TenantSecret ------------------
    // After refreshing, also sync TenantSecret (non-blocking)
    try {
      await prisma.tenantSecret.upsert({
        where: { tenantId: account.userId || userId },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token || account.refresh_token,
          expiresAt: newExpiresAt,
        },
        create: {
          tenantId: account.userId || userId,
          accessToken: access_token,
          refreshToken: refresh_token || account.refresh_token,
          expiresAt: newExpiresAt,
          locationId: account.locationId ?? '',
        },
      })
    } catch (err) {
      console.error('Failed to sync TenantSecret:', err)
    }

    return access_token
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

export interface UserContext {
  id: string
  locationId?: string
  accessToken: string
}

export async function getUserContext(userId: string): Promise<UserContext> {
  try {
    console.log('[AUTH DEBUG] getUserContext called with userId:', userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { provider: 'oauth' }
        }
      }
    })

    console.log('[AUTH DEBUG] Database user found:', user ? 'YES' : 'NO', user?.id)

    if (!user) {
      // Try to find user by locationId if the direct lookup failed
      const userByLocation = await prisma.user.findFirst({
        where: { 
          locationId: userId.replace('ghl_', '') // Remove ghl_ prefix if present
        },
        include: {
          accounts: {
            where: { provider: 'oauth' }
          }
        }
      })
      
      console.log('[AUTH DEBUG] User found by locationId:', userByLocation ? 'YES' : 'NO', userByLocation?.id)
      
      if (!userByLocation) {
        throw new Error(`User not found for ID: ${userId}`)
      }
      
      // Use the user found by location
      const accessToken = await getValidToken(userByLocation.id)
      if (!accessToken) {
        throw new Error('No valid access token found')
      }
      
      return {
        id: userByLocation.id,
        locationId: userByLocation.locationId || userByLocation.accounts[0]?.locationId || undefined,
        accessToken,
      }
    }

    const accessToken = await getValidToken(userId)
    if (!accessToken) {
      throw new Error('No valid access token found')
    }
    
    return {
      id: userId,
      locationId: user.locationId || user.accounts[0]?.locationId || undefined,
      accessToken,
    }
  } catch (error) {
    console.error('Error getting user context:', error)
    throw error
  }
} 