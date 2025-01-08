import PusherClient from "pusher-js"
import PusherServer from "pusher"

// Optional Pusher server instance - only created if credentials are provided
export const pusherServer = process.env.PUSHER_APP_ID
  ? new PusherServer({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null

// Optional Pusher client instance - only created if credentials are provided
export const pusherClient = process.env.NEXT_PUBLIC_PUSHER_KEY
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
  : null

// Helper function to safely trigger events
export async function triggerPusherEvent(channel: string, event: string, data: any) {
  if (!pusherServer) {
    console.log('Pusher is not configured. Event not sent:', { channel, event, data })
    return
  }

  try {
    await pusherServer.trigger(channel, event, data)
  } catch (error) {
    console.error('Error triggering Pusher event:', error)
  }
}

// Helper function to safely subscribe to events
export function subscribeToPusherChannel(channelName: string) {
  if (!pusherClient) {
    console.log('Pusher is not configured. Channel subscription skipped:', channelName)
    return null
  }

  return pusherClient.subscribe(channelName)
} 