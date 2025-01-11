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

## Background Job Processing

This project includes built-in background job processing using Bull and Redis. The following job queues are configured:

- Email Queue: For sending transactional emails asynchronously
- Stripe Webhook Queue: For processing Stripe webhook events
- Notification Queue: For handling user notifications (email, push, in-app)

### Features

- Automatic retries with exponential backoff
- Job progress tracking
- Error handling and logging
- Queue monitoring capabilities
- Persistent job storage using Redis

### Setup Background Jobs

1. Make sure you have Redis configured (same Redis instance used for rate limiting)
2. Jobs will be automatically processed in the background
3. Failed jobs will be retried up to 3 times with exponential backoff

### Usage Examples

```typescript
// Queue an email
import { queueEmail } from '@/lib/queue/processors';

await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform!</h1>',
});

// Queue a notification
import { queueNotification } from '@/lib/queue/processors';

await queueNotification({
  userId: 'user_123',
  type: 'in_app',
  title: 'New Message',
  message: 'You have a new message',
});
```

Stripe webhooks are automatically queued for processing to ensure reliable handling of subscription events.

## Image Upload Configuration

This project uses AWS S3 for image uploads (profile pictures). This is optional - the app will work without S3 configured, but users won't be able to upload profile pictures. If you need any other upload functionality or file storage, you will need to set this up.

### Setting up AWS S3

1. Create an AWS account if you don't have one
2. Create a new S3 bucket:
   - Go to S3 in AWS Console
   - Click "Create bucket"
   - Choose a unique bucket name
   - Select a region (remember this for configuration)
   - Under "Block Public Access settings", uncheck "Block all public access" (since we need public read access for images)
   - Click "Create bucket"

3. Create an IAM user with S3 access:
   - Go to IAM in AWS Console
   - Create a new user
   - Attach the `AmazonS3FullAccess` policy (or create a custom policy with more restricted permissions)
   - Save the Access Key ID and Secret Access Key

4. Configure your bucket for public access:
   - Go to your bucket
   - Click "Permissions"
   - Under "Bucket Policy", add this policy (replace `your-bucket-name`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicRead",
         "Effect": "Allow",
         "Principal": "*",
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::your-bucket-name/*"]
       }
     ]
   }
   ```

5. Add these variables to your `.env` file:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=your_bucket_region
   AWS_BUCKET_NAME=your_bucket_name
   ```

The app will automatically detect if S3 is configured and enable/disable image upload functionality accordingly.
