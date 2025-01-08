'use client'

import { trackCompleteRegistration as trackMetaRegistration, trackInitiateCheckout as trackMetaCheckout, trackSubscribe as trackMetaSubscribe } from './meta-pixel'
import { trackSignUp as trackGASignUp, trackBeginCheckout as trackGACheckout, trackSubscription as trackGASubscription } from './google-analytics'

export function trackSignUp() {
  trackMetaRegistration()
  trackGASignUp()
}

export function trackCheckoutStart(value?: number, currency: string = 'EUR') {
  trackMetaCheckout(value, currency)
  trackGACheckout(value, currency)
}

export function trackSubscriptionComplete(value?: number, currency: string = 'EUR', predicted_ltv?: number) {
  trackMetaSubscribe(value, currency, predicted_ltv)
  trackGASubscription(value, currency)
} 