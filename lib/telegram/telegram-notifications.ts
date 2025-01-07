interface TelegramConfig {
  botToken: string | undefined
  chatId: string | undefined
}

class TelegramNotificationService {
  private botToken: string | undefined
  private chatId: string | undefined
  private isEnabled: boolean

  constructor({ botToken, chatId }: TelegramConfig) {
    this.botToken = botToken
    this.chatId = chatId
    this.isEnabled = Boolean(botToken && chatId)
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.isEnabled) {
      console.log('Telegram notifications are disabled. Message not sent:', message)
      return
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      // Don't throw the error - we want the app to continue working even if notifications fail
    }
  }

  async notifyNewUser(user: { email: string; name?: string }): Promise<void> {
    const message = `🎉 <b>New User Registration</b>\n\nEmail: ${user.email}${user.name ? `\nName: ${user.name}` : ''}`
    await this.sendMessage(message)
  }
}

// Create a singleton instance with environment variables
export const telegramNotifications = new TelegramNotificationService({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
}) 