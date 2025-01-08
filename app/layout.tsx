import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/toaster"
import { IntercomProvider } from '@/components/intercom-provider'
import { MetaPixelProvider } from '@/components/meta-pixel-provider'
import { GoogleAnalyticsProvider } from '@/components/google-analytics-provider'
import { TikTokPixelProvider } from '@/components/tiktok-pixel-provider'
import { PinterestTagProvider } from '@/components/pinterest-tag-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Craftr - Modern SaaS Starter Kit",
    template: "%s | Craftr"
  },
  description: "Modern SaaS starter kit with Next.js 14, React, Tailwind, Auth, Billing, and more.",
  keywords: [
    "nextjs",
    "react",
    "tailwind",
    "stripe",
    "saas",
    "starter kit",
    "boilerplate",
    "template"
  ],
  authors: [
    {
      name: "Your Company",
      url: "https://yourcompany.com",
    },
  ],
  creator: "Your Company",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://craftr.com",
    title: "Craftr - Modern SaaS Starter Kit",
    description: "Modern SaaS starter kit with Next.js 14, React, Tailwind, Auth, Billing, and more.",
    siteName: "Craftr",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Craftr - Modern SaaS Starter Kit"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Craftr - Modern SaaS Starter Kit",
    description: "Modern SaaS starter kit with Next.js 14, React, Tailwind, Auth, Billing, and more.",
    images: ["/og-image.jpg"],
    creator: "@yourcompany"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <IntercomProvider />
            <MetaPixelProvider />
            <GoogleAnalyticsProvider />
            <TikTokPixelProvider />
            <PinterestTagProvider />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 