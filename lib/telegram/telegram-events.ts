import { telegramNotifications } from "./telegram-notifications"

export async function handleUserRegistration(user: { email: string; name?: string }) {
  // Send Telegram notification
  // This is safe to call even if Telegram is not configured
  await telegramNotifications.notifyNewUser(user)
} 