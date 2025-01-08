'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function TwitterPixelProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pixelId = process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID

  useEffect(() => {
    // Track page view on route change
    if (pixelId && window.twq) {
      window.twq('event', 'page_view')
    }
  }, [pathname, searchParams, pixelId])

  if (!pixelId) return null

  return (
    <Script
      id="twitter-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config', '${pixelId}');
          twq('event', 'page_view');
        `,
      }}
    />
  )
} 