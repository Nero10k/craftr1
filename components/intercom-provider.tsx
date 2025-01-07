'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    Intercom: any
    intercomSettings: any
  }
}

export function IntercomProvider() {
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_INTERCOM_APP_ID) return

    // Load Intercom script
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://widget.intercom.io/widget/' + process.env.NEXT_PUBLIC_INTERCOM_APP_ID
    document.body.appendChild(script)

    return () => {
      // Cleanup Intercom on unmount
      if (window.Intercom) {
        window.Intercom('shutdown')
      }
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_INTERCOM_APP_ID) return

    if (window.Intercom) {
      if (session?.user) {
        // Boot with user data
        window.Intercom('boot', {
          app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
          email: session.user.email,
          name: session.user.name,
          user_id: session.user.id,
          created_at: new Date().getTime(),
        })
      } else {
        // Boot without user data
        window.Intercom('boot', {
          app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
        })
      }
    }
  }, [session])

  // Update on route change
  useEffect(() => {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_INTERCOM_APP_ID) return

    if (window.Intercom) {
      window.Intercom('update')
    }
  }, [pathname])

  return null
} 