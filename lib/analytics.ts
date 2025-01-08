'use client'

import { trackCompleteRegistration as trackMetaRegistration, trackInitiateCheckout as trackMetaCheckout, trackSubscribe as trackMetaSubscribe } from './meta-pixel'
import { trackSignUp as trackGASignUp, trackBeginCheckout as trackGACheckout, trackSubscription as trackGASubscription } from './google-analytics'
import { trackCompleteRegistration as trackTikTokRegistration, trackInitiateCheckout as trackTikTokCheckout, trackSubscribe as trackTikTokSubscribe } from './tiktok-pixel'

export function trackSignUp() {
  trackMetaRegistration()
  trackGASignUp()
  trackTikTokRegistration()
}

export function trackCheckoutStart(value?: number, currency: string = 'EUR') {
  trackMetaCheckout(value, currency)
  trackGACheckout(value, currency)
  trackTikTokCheckout(value, currency)
}

export function trackSubscriptionComplete(value?: number, currency: string = 'EUR', predicted_ltv?: number) {
  trackMetaSubscribe(value, currency, predicted_ltv)
  trackGASubscription(value, currency)
  trackTikTokSubscribe(value, currency)
} 