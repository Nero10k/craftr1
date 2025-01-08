import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Craftr Billing - Flexible Plans for Every Need"
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
          {/* Page Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Flexible Plans
          </div>
          {/* Description */}
          <div
            style={{
              fontSize: 32,
              color: "#888888",
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            Choose the perfect plan for your needs
          </div>
          {/* Brand */}
          <div
            style={{
              fontSize: 24,
              color: "#666666",
              marginTop: "2rem",
            }}
          >
            CRAFTR
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 