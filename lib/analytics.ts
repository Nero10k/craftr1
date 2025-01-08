'use client'

import { trackCompleteRegistration as trackMetaRegistration, trackInitiateCheckout as trackMetaCheckout, trackSubscribe as trackMetaSubscribe } from './meta-pixel'
import { trackSignUp as trackGASignUp, trackBeginCheckout as trackGACheckout, trackSubscription as trackGASubscription } from './google-analytics'
import { trackCompleteRegistration as trackTikTokRegistration, trackInitiateCheckout as trackTikTokCheckout, trackSubscribe as trackTikTokSubscribe } from './tiktok-pixel'
import { trackCompleteRegistration as trackPinterestRegistration, trackInitiateCheckout as trackPinterestCheckout, trackSubscribe as trackPinterestSubscribe } from './pinterest-tag'
import { trackCompleteRegistration as trackTwitterRegistration, trackInitiateCheckout as trackTwitterCheckout, trackSubscribe as trackTwitterSubscribe } from './twitter-pixel'
import { trackCompleteRegistration as trackLinkedInRegistration, trackInitiateCheckout as trackLinkedInCheckout, trackSubscribe as trackLinkedInSubscribe } from './linkedin-tag'

export function trackSignUp() {
  trackMetaRegistration()
  trackGASignUp()
  trackTikTokRegistration()
  trackPinterestRegistration()
  trackTwitterRegistration()
  trackLinkedInRegistration()
}

export function trackCheckoutStart(value?: number, currency: string = 'EUR') {
  trackMetaCheckout(value, currency)
  trackGACheckout(value, currency)
  trackTikTokCheckout(value, currency)
  trackPinterestCheckout(value, currency)
  trackTwitterCheckout(value, currency)
  trackLinkedInCheckout(value, currency)
}

export function trackSubscriptionComplete(value?: number, currency: string = 'EUR', predicted_ltv?: number) {
  trackMetaSubscribe(value, currency, predicted_ltv)
  trackGASubscription(value, currency)
  trackTikTokSubscribe(value, currency)
  trackPinterestSubscribe(value, currency)
  trackTwitterSubscribe(value, currency)
  trackLinkedInSubscribe(value, currency)
} 