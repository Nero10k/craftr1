import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { AuthOptions, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"
import { UserRole } from "@prisma/client"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            role: true,
            image: true,
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionStatus: true,
            stripeCurrentPeriodEnd: true,
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
          stripeCustomerId: user.stripeCustomerId,
          stripePriceId: user.stripePriceId,
          stripeSubscriptionStatus: user.stripeSubscriptionStatus,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email as string
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.role = token.role as UserRole
        session.user.image = token.picture as string | null
        session.user.stripeCustomerId = token.stripeCustomerId as string | null
        session.user.stripePriceId = token.stripePriceId as string | null
        session.user.stripeSubscriptionStatus = token.stripeSubscriptionStatus as string | null
        session.user.stripeCurrentPeriodEnd = token.stripeCurrentPeriodEnd as Date | null
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role as UserRole
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.stripeCustomerId = user.stripeCustomerId
        token.stripePriceId = user.stripePriceId
        token.stripeSubscriptionStatus = user.stripeSubscriptionStatus
        token.stripeCurrentPeriodEnd = user.stripeCurrentPeriodEnd
      }

      if (account?.provider === 'google' && profile) {
        const nameParts = profile.name?.split(' ') || []
        token.firstName = nameParts[0] || ''
        token.lastName = nameParts.slice(1).join(' ') || ''
        token.picture = profile.picture as string || token.picture || null

        try {
          const updatedUser = await prisma.user.update({
            where: { email: profile.email },
            data: {
              firstName: token.firstName,
              lastName: token.lastName,
              image: token.picture as string | null,
              emailVerified: new Date(),
            },
          })
          token.picture = updatedUser.image
        } catch (error) {
          console.error('Error updating user profile:', error)
        }
      }

      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 