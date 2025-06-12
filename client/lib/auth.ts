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
      // Extract the actual GoHighLevel userId
      const ghlUserId = user.id || user.sub || 'unknown'
      
      // Use the GoHighLevel userId
      return await prisma.user.create({
        data: {
          id: ghlUserId,
          name: user.name,
          email: user.email,
          image: user.image,
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
          scope: "businesses.write calendars.readonly calendars.write blogs/list.readonly socialplanner/tag.write socialplanner/category.write blogs/posts.readonly custom-menu-link.write blogs/author.readonly custom-menu-link.readonly blogs/category.readonly businesses.readonly companies.readonly calendars/events.readonly calendars/events.write calendars/groups.readonly calendars/groups.write calendars/resources.readonly calendars/resources.write conversations.readonly campaigns.readonly conversations.write conversations/message.readonly conversations/message.write conversations/reports.readonly conversations/livechat.write contacts.readonly contacts.write objects/schema.readonly objects/schema.write objects/record.readonly objects/record.write associations.write associations.readonly associations/relation.readonly associations/relation.write courses.write courses.readonly forms.readonly forms.write invoices.readonly invoices.write invoices/schedule.readonly invoices/schedule.write invoices/template.readonly invoices/template.write invoices/estimate.readonly invoices/estimate.write links.readonly lc-email.readonly links.write locations.write locations.readonly locations/customValues.readonly locations/customValues.write locations/customFields.readonly locations/customFields.write locations/tasks.write locations/tasks.readonly locations/tags.write locations/tags.readonly medias.readonly locations/templates.readonly medias.write funnels/redirect.readonly funnels/page.readonly funnels/funnel.readonly funnels/pagecount.readonly funnels/redirect.write oauth.write oauth.readonly opportunities.readonly payments/orders.readonly opportunities.write payments/orders.write payments/integration.readonly payments/integration.write payments/transactions.readonly payments/subscriptions.readonly payments/coupons.readonly payments/coupons.write payments/custom-provider.readonly payments/custom-provider.write products.readonly products.write products/prices.readonly products/prices.write products/collection.readonly saas/company.read products/collection.write saas/company.write saas/location.read saas/location.write snapshots.readonly snapshots.write socialplanner/oauth.readonly socialplanner/oauth.write socialplanner/post.readonly socialplanner/post.write socialplanner/account.readonly socialplanner/account.write socialplanner/csv.readonly socialplanner/category.readonly socialplanner/csv.write store/shipping.readonly socialplanner/tag.readonly store/shipping.write store/setting.readonly store/setting.write surveys.readonly users.readonly users.write workflows.readonly emails/builder.write emails/builder.readonly emails/schedule.readonly wordpress.site.readonly blogs/post.write blogs/post-update.write blogs/check-slug.readonly",
          user_type: "Location"
        }
      },
      token: "https://services.leadconnectorhq.com/oauth/token",
      userinfo: {
        async request(context) {
          // GoHighLevel doesn't have a userinfo endpoint
          // Extract user info from the token response instead
          return {
            sub: (context.tokens.userId as string) || 'unknown',
            name: 'GoHighLevel User',
            email: undefined,
          }
        }
      },
      clientId: process.env.GHL_CLIENT_ID,
      clientSecret: process.env.GHL_CLIENT_SECRET,
      profile(profile, tokens) {
        // Extract userId from tokens response
        const ghlUserId = profile.sub || tokens.userId || tokens.sub || 'unknown'
        
        const userObj = {
          id: ghlUserId,
          name: 'GoHighLevel User',
          email: undefined,
          image: null,
        }
        return userObj
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store OAuth tokens and GoHighLevel specific data
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.locationId = account.locationId
        token.companyId = account.companyId
        token.userId = account.userId
        token.planId = account.planId
        token.userType = (account as any).userType
        token.approvedLocations = (account as any).approvedLocations
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.locationId = token.locationId as string
      session.companyId = token.companyId as string
      session.planId = token.planId as string
      session.userType = token.userType as string
      session.approvedLocations = (token.approvedLocations as string[]) || []
      session.user.id = token.userId as string
      return session
    },
    async signIn({ account, profile, user }) {
      if (account?.provider === "oauth") {
        try {
          // Extract GoHighLevel specific fields from the token response
          const tokenResponse = account as any
          const ghlUserId = tokenResponse.userId
          
          // Update the user object with the correct ID
          if (ghlUserId) {
            user.id = ghlUserId
          }
          
          // Map the OAuth response fields to our account object
          account.locationId = tokenResponse.locationId
          account.companyId = tokenResponse.companyId  
          account.userId = tokenResponse.userId
          account.planId = tokenResponse.planId
          account.userType = tokenResponse.userType || 'Location'
          account.approvedLocations = tokenResponse.approvedLocations
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
              locationId: (account as any).locationId,
              // Note: Other GHL fields like companyId, planId, userType, approvedLocations 
              // are stored in the JWT token and accessible via session
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
              locationId: (account as any).locationId,
              // Note: Other GHL fields like companyId, planId, userType, approvedLocations 
              // are stored in the JWT token and accessible via session
            },
          })
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
}

export async function getValidToken(userId: string): Promise<string | null> {
  try {
    // Get the user's account
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'oauth'
      }
    })

    if (!account?.access_token) {
      throw new Error('No access token found')
    }

    // Check if token is still valid (with 5-minute buffer)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = account.expires_at || 0
    const buffer = 5 * 60 // 5 minutes

    if (expiresAt > now + buffer) {
      return account.access_token
    }

    // Token is expired or about to expire, refresh it
    if (!account.refresh_token) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post<TokenResponse>(
      'https://services.leadconnectorhq.com/oauth/token',
      {
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
        client_id: process.env.GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
      },
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
        refresh_token,
        expires_at: newExpiresAt,
      },
    })

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { provider: 'oauth' }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
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