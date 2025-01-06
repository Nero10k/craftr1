import { DefaultSession } from "next-auth"
import { Role } from "@/lib/auth/types"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName?: string | null
      lastName?: string | null
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    firstName?: string | null
    lastName?: string | null
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName?: string | null
    lastName?: string | null
    role: Role
  }
} 