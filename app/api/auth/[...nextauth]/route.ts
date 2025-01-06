import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import NextAuth, { AuthOptions, Session, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
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
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.role = token.role as Role
      }

      return session
    },
    async jwt({ token, user }: { token: JWT; user: User | null }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = (user as UserWithRole).role
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 