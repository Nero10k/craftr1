import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Craftr - Modern SaaS Starter Kit"
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #000000, #111111)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: 96,
              fontWeight: "bold",
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            CRAFTR
          </div>
          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: "#888888",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            Modern SaaS Starter Kit
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 