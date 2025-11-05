import { writable, get, derived } from 'svelte/store'
import { WebSocketClient } from '../websocket/client'

// Singleton WebSocket client instance
let wsClient: WebSocketClient | null = null

// Store for client ID
export const clientId = writable<string>('')

// Re-export stores from client when available
export const wsConnection = writable<WebSocket | null>(null)
export const wsStatus = writable<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
export const wsError = writable<string>('')

/**
 * Connect to WebSocket with authentication and auto-reconnect
 * @deprecated Use createWebSocketClient() for new code
 */
export function connectWebSocket(url: string, id: string, autoReconnect = false) {
	// Disconnect existing client
	if (wsClient) {
		wsClient.destroy()
	}

	clientId.set(id)

	// Create new client
	wsClient = new WebSocketClient(url, id, {
		autoReconnect,
		maxReconnectAttempts: 5,
		reconnectDelay: 3000
	})

	// Subscribe to client stores and mirror to legacy stores
	wsClient.status.subscribe((status) => wsStatus.set(status))
	wsClient.error.subscribe((error) => wsError.set(error))
	wsClient.connection.subscribe((conn) => wsConnection.set(conn))

	// Connect
	wsClient.connect()

	return wsClient
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket() {
	if (wsClient) {
		wsClient.disconnect()
		wsClient = null
	}
}

/**
 * Get current WebSocket client instance
 */
export function getWebSocketClient(): WebSocketClient | null {
	return wsClient
}

/**
 * Create a new WebSocket client instance (recommended for new code)
 */
export function createWebSocketClient(
	url: string,
	clientId: string,
	options?: { autoReconnect?: boolean; maxReconnectAttempts?: number }
): WebSocketClient {
	return new WebSocketClient(url, clientId, options)
}

/**
 * Derived store for connection status
 */
export const isConnected = derived(wsStatus, ($status) => $status === 'connected')


