"use client"

import { useEffect, useRef } from 'react'
import { pusherClient, subscribeToPusherChannel } from '@/lib/pusher/pusher-client'

interface UseRealtimeOptions {
  channel: string
  event: string
  onReceive: (data: any) => void
}

export function useRealtime({ channel, event, onReceive }: UseRealtimeOptions) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    // If Pusher is not configured, do nothing
    if (!pusherClient) {
      return
    }

    // Subscribe to channel
    channelRef.current = subscribeToPusherChannel(channel)

    // Bind to event
    if (channelRef.current) {
      channelRef.current.bind(event, onReceive)
    }

    // Cleanup
    return () => {
      if (channelRef.current && pusherClient) {
        channelRef.current.unbind(event)
        pusherClient.unsubscribe(channel)
      }
    }
  }, [channel, event, onReceive])
} 