import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { AuthOptions, Session, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"
import { prisma } from "@/lib/db"
import { Role } from "@/lib/auth/types"

type UserWithRole = {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  password: string | null
  role: Role
  image: string | null
}

interface ExtendedUser extends Omit<User, 'role'> {
  firstName?: string | null
  lastName?: string | null
  role?: Role
  image?: string | null
}

interface ExtendedJWT extends Omit<JWT, 'id'> {
  id: string
  firstName?: string | null
  lastName?: string | null
  role?: Role
  image?: string | null
  picture?: string | null
}

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
          }
        }) as UserWithRole | null

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
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: ExtendedJWT; session: Session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.role = token.role as Role
        session.user.image = (token.image || token.picture || null) as string | null
      }

      return session
    },
    async jwt({ token, user, account, profile, trigger, session }: { token: ExtendedJWT; user: ExtendedUser | null; account: any; profile?: any; trigger?: string; session?: any }) {
      if (trigger === 'update' && session?.user) {
        return {
          ...token,
          ...session.user,
          image: session.user.image as string | null,
        }
      }

      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = (user.role || 'USER') as Role
        token.image = user.image || null
      }
      
      if (account?.provider === 'google' && profile) {
        const nameParts = profile.name?.split(' ') || []
        token.firstName = nameParts[0] || ''
        token.lastName = nameParts.slice(1).join(' ') || ''
        token.image = (profile.picture as string) || token.image || null
        
        try {
          const updatedUser = await prisma.user.update({
            where: { email: profile.email },
            data: {
              firstName: token.firstName,
              lastName: token.lastName,
              name: profile.name,
              image: token.image as string | null,
              emailVerified: new Date(),
            },
          })
          token.image = updatedUser.image
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