'use client'

declare global {
  interface Window {
    twq: any
  }
}

export function trackTwitterEvent(eventName: string, options = {}) {
  // Only track if Twitter Pixel is configured and we're in the browser
  if (typeof window !== 'undefined' && window.twq && process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID) {
    window.twq('event', eventName, options)
  }
}

export function trackCompleteRegistration() {
  trackTwitterEvent('tw-o9l3o-og0ku', {
    status: 'success'
  })
}

export function trackInitiateCheckout(value?: number, currency: string = 'EUR') {
  trackTwitterEvent('tw-o9l3o-og0kw', {
    currency,
    value,
  })
}

export function trackSubscribe(value?: number, currency: string = 'EUR') {
  trackTwitterEvent('tw-o9l3o-og0ky', {
    currency,
    value,
  })
} 