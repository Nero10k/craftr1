'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function LinkedInTagProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tagId = process.env.NEXT_PUBLIC_LINKEDIN_TAG_ID

  useEffect(() => {
    // Track page view on route change
    if (tagId && window.lintrk) {
      window.lintrk('track', { conversion_id: 'pagevisit' })
    }
  }, [pathname, searchParams, tagId])

  if (!tagId) return null

  return (
    <Script
      id="linkedin-tag"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          _linkedin_partner_id = "${tagId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);

          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a, b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `,
      }}
    />
  )
} 