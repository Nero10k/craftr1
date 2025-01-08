'use client'

declare global {
  interface Window {
    ttq: any
  }
}

export function trackTikTokEvent(eventName: string, options = {}) {
  // Only track if TikTok Pixel is configured and we're in the browser
  if (typeof window !== 'undefined' && window.ttq && process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID) {
    window.ttq.track(eventName, options)
  }
}

export function trackCompleteRegistration() {
  trackTikTokEvent('CompleteRegistration')
}

export function trackInitiateCheckout(value?: number, currency: string = 'EUR') {
  trackTikTokEvent('InitiateCheckout', {
    currency,
    value,
  })
}

export function trackSubscribe(value?: number, currency: string = 'EUR') {
  trackTikTokEvent('Subscribe', {
    currency,
    value,
  })
} 