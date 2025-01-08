'use client'

declare global {
  interface Window {
    pintrk: any
  }
}

export function trackPinterestEvent(eventName: string, options = {}) {
  // Only track if Pinterest Tag is configured and we're in the browser
  if (typeof window !== 'undefined' && window.pintrk && process.env.NEXT_PUBLIC_PINTEREST_TAG_ID) {
    window.pintrk('track', eventName, options)
  }
}

export function trackCompleteRegistration() {
  trackPinterestEvent('signup')
}

export function trackInitiateCheckout(value?: number, currency: string = 'EUR') {
  trackPinterestEvent('addtocart', {
    currency,
    value,
  })
}

export function trackSubscribe(value?: number, currency: string = 'EUR') {
  trackPinterestEvent('checkout', {
    currency,
    value,
    order_quantity: 1,
    line_items: [
      {
        product_name: 'Subscription',
        product_price: value,
        product_quantity: 1
      }
    ]
  })
} 