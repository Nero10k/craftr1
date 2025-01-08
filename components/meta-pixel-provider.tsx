'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    fbq: any
  }
}

export function MetaPixelProvider() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only load Meta Pixel if ID is provided
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_META_PIXEL_ID) return

    // Load Meta Pixel script
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    // Initialize Meta Pixel
    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments)
    }
    window.fbq.push = window.fbq
    window.fbq.loaded = true
    window.fbq.version = '2.0'
    window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID)

    // Track initial pageview
    window.fbq('track', 'PageView')

    return () => {
      // Cleanup Meta Pixel on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Track pageviews on route changes
  useEffect(() => {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_META_PIXEL_ID || !window.fbq) return

    window.fbq('track', 'PageView')
  }, [pathname, searchParams])

  return null
} 