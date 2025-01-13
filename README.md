# CRAFTR - AI Content Generator

CRAFTR is a powerful AI-powered content generation platform built with Next.js, featuring automated content creation, scheduling, and LinkedIn integration.

## Features

- 🤖 AI-powered content generation
- 📅 Content scheduling
- 📊 Performance analytics
- 🔄 Automated posting
- 🔗 LinkedIn integration
- 📈 Analytics tracking

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Tailwind CSS
- shadcn/ui
- OpenAI API
- LinkedIn API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- LinkedIn Developer account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/craftr.git
   cd craftr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env`

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Required environment variables:

```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OPENAI_API_KEY=
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PLAN_ID=
```

For LinkedIn integration:
```env
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_ID=
```

## Deployment

The app is configured for deployment on Vercel with GitHub Actions.

### Setup GitHub Actions

1. Fork this repository
2. Add the following secrets to your GitHub repository:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `STRIPE_API_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRO_MONTHLY_PLAN_ID`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. Push to the main branch to trigger deployment

### Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
