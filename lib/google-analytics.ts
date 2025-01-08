'use client'

declare global {
  interface Window {
    gtag: any
  }
}

export function trackGAEvent(eventName: string, params = {}) {
  // Only track if GA is configured and we're in the browser
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, params)
  }
}

export function trackSignUp() {
  trackGAEvent('sign_up')
}

export function trackBeginCheckout(value?: number, currency: string = 'EUR') {
  trackGAEvent('begin_checkout', {
    currency,
    value,
  })
}

export function trackSubscription(value?: number, currency: string = 'EUR') {
  trackGAEvent('purchase', {
    currency,
    value,
    subscription: true,
  })
} 