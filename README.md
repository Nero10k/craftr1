# CRAFTR SaaS Template

A modern, full-featured Next.js boilerplate for SaaS applications with authentication, beautiful UI components, and best practices built-in.

## Features

- 🚀 Built with Next.js 15
- 🎨 Styled with Tailwind CSS
- 🔒 Authentication ready
- 🎯 TypeScript support
- 📱 Responsive design
- 🌙 Dark mode support
- 🧩 Modular component architecture
- 🔧 Easy to customize

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/CRAFTR-Netherlands/CRAFTR-SaaS-Template.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layouts/          # Layout components
│   ├── shared/           # Shared components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and constants
└── public/              # Static files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Rate Limiting

This project includes built-in rate limiting using Upstash Redis. Rate limits are configured for different types of routes:

- Auth endpoints: 10 requests per minute
- API endpoints: 100 requests per minute
- Admin endpoints: 300 requests per minute
- Stripe webhooks: 50 requests per minute

### Setup Rate Limiting

1. Create a free account at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy your REST URL and REST Token
4. Add them to your `.env` file:

```bash
UPSTASH_REDIS_REST_URL=your_rest_url
UPSTASH_REDIS_REST_TOKEN=your_rest_token
```

The rate limiting will automatically work for all API routes. When limits are exceeded, the API will return a 429 status code with appropriate rate limit headers.
