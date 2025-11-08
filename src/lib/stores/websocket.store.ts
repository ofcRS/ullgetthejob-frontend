import { writable } from 'svelte/store'
import { createWebSocketClient } from './ws.store'
import type { WebSocketClient } from '../websocket/client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000'

export const websocketStore = writable<any>(null)

let wsClient: WebSocketClient | null = null

export function connectWebSocket(userId: string) {
  if (wsClient) {
    return // Already connected
  }

  const baseUrl = WS_URL.replace(/^http/, 'ws')
  const wsUrl = `${baseUrl}/ws`

  wsClient = createWebSocketClient(wsUrl, userId, {
    autoReconnect: true,
    maxReconnectAttempts: 5
  })

  // Listen for all messages using wildcard
  wsClient.on('*', (message: any) => {
    try {
      websocketStore.set(message)
    } catch (error) {
      console.error('Failed to handle WebSocket message:', error)
    }
  })

  // Connect to the WebSocket
  wsClient.connect()
}

export function disconnectWebSocket() {
  if (wsClient) {
    wsClient.disconnect()
    wsClient = null
  }
}
