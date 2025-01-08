'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackSubscriptionComplete } from '@/lib/analytics'
import { PLANS } from '@/lib/stripe/config'

export function SubscriptionSuccess() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const priceId = searchParams.get('price_id')

  useEffect(() => {
    // Only track on successful subscription and when we have a price ID
    if (success === 'true' && priceId) {
      const plan = Object.values(PLANS).find(p => p.priceId === priceId)
      if (plan) {
        // For subscription, we can set predicted_ltv as annual value
        const annualValue = plan.price * 12
        trackSubscriptionComplete(plan.price, 'USD', annualValue)
      }
    }
  }, [success, priceId])

  return null
} 