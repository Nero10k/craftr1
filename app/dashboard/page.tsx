import { requireAuth } from "@/lib/session"

export default async function DashboardPage() {
  // This will redirect to /login if user is not authenticated
  const session = await requireAuth()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back, {session.user.firstName || session.user.email}!</p>
    </div>
  )
} 