import { hash } from "bcryptjs"
import { prisma } from "./db"

export async function registerUser({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string
  password: string
  firstName?: string
  lastName?: string
}) {
  const hashedPassword = await hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  })

  return user
} 