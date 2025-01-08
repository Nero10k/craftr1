import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PLANS } from '@/lib/stripe/config'
import { BillingForm } from '@/components/billing/billing-form'
import { redirect } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/')
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        stripePriceId: true,
        stripeSubscriptionStatus: true,
        stripeCurrentPeriodEnd: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const subscriptionPlan = user.stripePriceId
      ? Object.values(PLANS).find((plan) => plan.priceId === user.stripePriceId)
      : null

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Billing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </AppHeader>
          <main className="container max-w-[1000px] p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Billing</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription and billing information
                </p>
              </div>
            </div>
            <Separator className="my-6" />
            <BillingForm
              subscriptionPlan={subscriptionPlan?.name ?? 'Free'}
              stripeCustomerId={user.stripeCustomerId}
              stripeSubscriptionStatus={user.stripeSubscriptionStatus}
              stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  } catch (error) {
    console.error('Error loading billing page:', error)
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Billing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </AppHeader>
          <main className="container max-w-[1000px] p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Billing</h2>
                <p className="text-red-500">
                  There was an error loading your billing information. Please try again later.
                </p>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }
} 