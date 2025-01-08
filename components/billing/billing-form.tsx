"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PLANS } from '@/lib/stripe/config'
import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { trackCheckoutStart } from '@/lib/analytics'

interface BillingFormProps {
  subscriptionPlan: string
  stripeCustomerId: string | null
  stripeSubscriptionStatus: string | null
  stripeCurrentPeriodEnd: Date | null
}

export function BillingForm({
  subscriptionPlan,
  stripeCustomerId,
  stripeSubscriptionStatus,
  stripeCurrentPeriodEnd,
}: BillingFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(priceId: string | undefined) {
    if (!priceId) return

    try {
      setIsLoading(true)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        const plan = Object.values(PLANS).find(p => p.priceId === priceId)
        if (plan) {
          trackCheckoutStart(plan.price, 'USD')
        }
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onPortalClick() {
    try {
      setIsLoading(true)

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {Object.values(PLANS).map((plan) => {
        const isCurrentPlan = subscriptionPlan === plan.name
        const isProPlan = plan.name === 'Pro'

        return (
          <Card 
            key={plan.name} 
            className={cn(
              "flex flex-col",
              isProPlan && "border-primary shadow-md"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                {isProPlan && (
                  <Badge variant="default" className="h-6">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.name === 'Free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : stripeSubscriptionStatus === 'active' && isCurrentPlan ? (
                <Button
                  className="w-full"
                  onClick={onPortalClick}
                  disabled={isLoading || !stripeCustomerId}
                >
                  {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={isProPlan ? "default" : "outline"}
                  onClick={() => onSubmit('priceId' in plan ? plan.priceId : undefined)}
                  disabled={isLoading || !('priceId' in plan)}
                >
                  {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isProPlan ? "Upgrade to Pro" : "Get Started"}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
      {stripeCurrentPeriodEnd && subscriptionPlan === 'Pro' && (
        <div className="col-span-2 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Icons.info className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Your Pro plan will renew on {new Date(stripeCurrentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 