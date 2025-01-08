'use client'

declare global {
  interface Window {
    lintrk: any
  }
}

export function trackLinkedInEvent(eventName: string, options = {}) {
  // Only track if LinkedIn Tag is configured and we're in the browser
  if (typeof window !== 'undefined' && window.lintrk && process.env.NEXT_PUBLIC_LINKEDIN_TAG_ID) {
    window.lintrk('track', { conversion_id: eventName, ...options })
  }
}

export function trackCompleteRegistration() {
  trackLinkedInEvent('signup', {
    status: 'success'
  })
}

export function trackInitiateCheckout(value?: number, currency: string = 'EUR') {
  trackLinkedInEvent('addtocart', {
    currency,
    value,
  })
}

export function trackSubscribe(value?: number, currency: string = 'EUR') {
  trackLinkedInEvent('purchase', {
    currency,
    value,
  })
} 