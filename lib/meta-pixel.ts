'use client'

declare global {
  interface Window {
    fbq: any
  }
}

export function trackPixelEvent(eventName: string, options = {}) {
  // Only track if Meta Pixel is configured and we're in the browser
  if (typeof window !== 'undefined' && window.fbq && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
    window.fbq('track', eventName, options)
  }
}

export function trackCompleteRegistration() {
  trackPixelEvent('CompleteRegistration', {
    status: 'success'
  })
}

export function trackInitiateCheckout(value?: number, currency: string = 'USD') {
  trackPixelEvent('InitiateCheckout', {
    currency,
    value,
  })
}

export function trackSubscribe(value?: number, currency: string = 'USD', predicted_ltv?: number) {
  trackPixelEvent('Subscribe', {
    currency,
    value,
    predicted_ltv,
  })
} 