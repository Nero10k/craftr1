import Image from "next/image"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

interface AuthLayoutProps {
  children: React.ReactNode
  showImagePanel?: boolean
  imageSrc?: string
  imageAlt?: string
}

export function AuthLayout({
  children,
  showImagePanel = true,
  imageSrc = "/images/auth-background.jpg",
  imageAlt = "Background"
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-8 md:p-12">
        <div className="flex justify-center md:justify-start">
          <Link
            href="/"
            className="rounded-xl p-2 transition-colors hover:bg-accent"
          >
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
      {showImagePanel && (
        <div className="relative hidden lg:block">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
      )}
    </div>
  )
} 