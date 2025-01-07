import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Profile {
    picture?: string
    email_verified?: boolean
    email?: string
    name?: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      firstName?: string | null
      lastName?: string | null
      stripeCustomerId?: string | null
      stripePriceId?: string | null
      stripeSubscriptionStatus?: string | null
      stripeCurrentPeriodEnd?: Date | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    stripeCustomerId?: string | null
    stripePriceId?: string | null
    stripeSubscriptionStatus?: string | null
    stripeCurrentPeriodEnd?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    stripeCustomerId?: string | null
    stripePriceId?: string | null
    stripeSubscriptionStatus?: string | null
    stripeCurrentPeriodEnd?: Date | null
  }
} 