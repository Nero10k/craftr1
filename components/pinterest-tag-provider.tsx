'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PinterestTagProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tagId = process.env.NEXT_PUBLIC_PINTEREST_TAG_ID

  useEffect(() => {
    // Track page view on route change
    if (tagId && window.pintrk) {
      window.pintrk('track', 'pagevisit')
    }
  }, [pathname, searchParams, tagId])

  if (!tagId) return null

  return (
    <Script
      id="pinterest-tag"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(e){if(!window.pintrk){window.pintrk = function () {
          window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
          n=window.pintrk;n.queue=[],n.version="3.0";var
          t=document.createElement("script");t.async=!0,t.src=e;var
          r=document.getElementsByTagName("script")[0];
          r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
          pintrk('load', '${tagId}');
          pintrk('page');
        `,
      }}
    />
  )
} 