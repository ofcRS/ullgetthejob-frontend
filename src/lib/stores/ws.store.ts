import { writable, get } from 'svelte/store'

export const wsConnection = writable<WebSocket | null>(null)
export const wsStatus = writable<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
export const clientId = writable<string>('')
export const wsError = writable<string>('')

let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

export function connectWebSocket(url: string, id: string, autoReconnect = false) {
  // Close existing connection if any
  const existing = get(wsConnection)
  if (existing) {
    if (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING) {
      console.log('Closing existing WebSocket connection')
      existing.close()
    }
  }

  clientId.set(id)
  wsStatus.set('connecting')
  wsError.set('')

  try {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('WebSocket connected')
      wsStatus.set('connected')
      wsError.set('')
      reconnectAttempts = 0

      try {
        ws.send(JSON.stringify({ type: 'register', clientId: id }))
      } catch (err) {
        console.error('Failed to register WebSocket client:', err)
        wsError.set('Failed to register with server')
        wsStatus.set('error')
      }
    }

    ws.onerror = (event) => {
      console.error('WebSocket error:', event)
      wsError.set('Connection error occurred')
      wsStatus.set('error')
    }

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
      wsStatus.set('disconnected')

      // Attempt reconnection if enabled and not intentionally closed
      if (autoReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
        reconnectAttempts++
        const delay = RECONNECT_DELAY * reconnectAttempts
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms`)
        wsError.set(`Connection lost. Reconnecting... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)

        setTimeout(() => {
          connectWebSocket(url, id, autoReconnect)
        }, delay)
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        wsError.set('Failed to reconnect after multiple attempts. Please refresh the page.')
      }
    }

    wsConnection.set(ws)
  } catch (err) {
    console.error('Failed to create WebSocket:', err)
    wsStatus.set('error')
    wsError.set(err instanceof Error ? err.message : 'Failed to connect')
  }
}

export function disconnectWebSocket() {
  const ws = get(wsConnection)
  if (ws) {
    // Prevent reconnection by setting attempts to max
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS
    ws.close(1000, 'Client disconnect')
    wsConnection.set(null)
    wsStatus.set('disconnected')
    wsError.set('')
  }
}


