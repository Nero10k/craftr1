export const siteConfig = {
  name: "CRAFTR",
  description: "Modern SaaS Platform",
  links: {
    github: "https://github.com/your-repo",
    docs: "/docs"
  }
} as const

export const routes = {
  home: "/",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard"
} as const 