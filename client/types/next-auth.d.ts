import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    locationId?: string
    companyId?: string
    planId?: string
    userType?: string
    approvedLocations?: string[]
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
  }

  interface Account {
    locationId?: string
    companyId?: string
    userId?: string
    planId?: string
    userType?: string
    approvedLocations?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    locationId?: string
    companyId?: string
    userId?: string
    planId?: string
    userType?: string
    approvedLocations?: string[]
  }
} 