import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  const appName = "Craftr" // Your app name

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Update this with your verified domain
      to: email,
      subject: 'Verify your email address',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    .content {
      padding: 20px;
      background: white;
    }
    h1 {
      color: #111827;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      margin: 16px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .link {
      color: #2563eb;
      text-decoration: none;
    }
    .link:hover {
      text-decoration: underline;
    }
    .code {
      background-color: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      ${appName}
    </div>
    <div class="content">
      <h1>Verify your email address</h1>
      <p>Thanks for signing up for ${appName}! We're excited to have you on board.</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${confirmLink}" class="button">Verify Email Address</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p class="code">${confirmLink}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you didn't create an account with ${appName}, you can safely ignore this email.</p>
      <div class="footer">
        <p>
          Need help? Contact our support team at 
          <a href="mailto:support@example.com" class="link">support@example.com</a>
        </p>
        <p>
          ${appName} Inc.<br>
          123 Example Street<br>
          San Francisco, CA 94105
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
} 