import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { JWT } from 'next-auth/jwt'
import { Session, User, Account, Profile } from 'next-auth'
import { AdapterUser } from 'next-auth/adapters'

type Role = UserRole

interface ExtendedJWT extends JWT {
  role: Role
  firstName?: string | null
  lastName?: string | null
  stripeCustomerId?: string | null
  stripePriceId?: string | null
  stripeSubscriptionStatus?: string | null
  stripeCurrentPeriodEnd?: Date | null
}

interface ExtendedUser extends User {
  role: Role
  firstName?: string | null
  lastName?: string | null
  stripeCustomerId?: string | null
  stripePriceId?: string | null
  stripeSubscriptionStatus?: string | null
  stripeCurrentPeriodEnd?: Date | null
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
            firstName: true,
            lastName: true,
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionStatus: true,
            stripeCurrentPeriodEnd: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          stripeCustomerId: user.stripeCustomerId,
          stripePriceId: user.stripePriceId,
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.role = token.role as Role
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.stripeCustomerId = token.stripeCustomerId as string | null
        session.user.stripePriceId = token.stripePriceId as string | null
        session.user.stripeSubscriptionStatus = token.stripeSubscriptionStatus as string | null
        session.user.stripeCurrentPeriodEnd = token.stripeCurrentPeriodEnd as Date | null
      }

      return session
    },
    async jwt({ token, user, account, profile }) {
      if (!token.email) {
        return token
      }

      if (user) {
        token.id = user.id
        token.role = (user as ExtendedUser).role
        token.firstName = (user as ExtendedUser).firstName
        token.lastName = (user as ExtendedUser).lastName
        token.stripeCustomerId = (user as ExtendedUser).stripeCustomerId
        token.stripePriceId = (user as ExtendedUser).stripePriceId
        token.stripeSubscriptionStatus = (user as ExtendedUser).stripeSubscriptionStatus
        token.stripeCurrentPeriodEnd = (user as ExtendedUser).stripeCurrentPeriodEnd
        return token
      }

      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          firstName: true,
          lastName: true,
          stripeCustomerId: true,
          stripePriceId: true,
          stripeSubscriptionStatus: true,
          stripeCurrentPeriodEnd: true,
        },
      })

      if (!dbUser) {
        return token
      }

      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        stripeCustomerId: dbUser.stripeCustomerId,
        stripePriceId: dbUser.stripePriceId,
        stripeSubscriptionStatus: dbUser.stripeSubscriptionStatus,
        stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
      }
    },
  },
} 