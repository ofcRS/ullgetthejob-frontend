import { writable, get } from 'svelte/store'
import { auth } from '../auth/store'

export type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type WSMessage = { type: string; [key: string]: any }
export type MessageHandler = (message: WSMessage) => void

interface WebSocketClientOptions {
	autoReconnect?: boolean
	maxReconnectAttempts?: number
	reconnectDelay?: number
	timeout?: number
}

const DEFAULT_OPTIONS: Required<WebSocketClientOptions> = {
	autoReconnect: true,
	maxReconnectAttempts: 5,
	reconnectDelay: 3000,
	timeout: 30000
}

/**
 * Robust WebSocket client with authentication, auto-reconnect, and message queuing
 */
export class WebSocketClient {
	private ws: WebSocket | null = null
	private url: string
	private clientId: string
	private options: Required<WebSocketClientOptions>
	private reconnectAttempts = 0
	private messageQueue: WSMessage[] = []
	private messageHandlers = new Map<string, MessageHandler[]>()
	private reconnectTimer: number | null = null

	// Stores
	readonly status = writable<WSStatus>('disconnected')
	readonly error = writable<string>('')
	readonly connection = writable<WebSocket | null>(null)

	constructor(url: string, clientId: string, options: WebSocketClientOptions = {}) {
		this.url = url
		this.clientId = clientId
		this.options = { ...DEFAULT_OPTIONS, ...options }
	}

	/**
	 * Connect to WebSocket server with authentication
	 */
	connect(): void {
		// Close existing connection
		if (this.ws) {
			this.ws.close(1000, 'Reconnecting')
		}

		this.status.set('connecting')
		this.error.set('')

		try {
			// Get authentication token from store
			const authState = get(auth)
			const isAuthenticated = authState.isAuthenticated

			// Build WebSocket URL with authentication
			let wsUrl = this.url

			// Add client ID as query parameter
			const separator = wsUrl.includes('?') ? '&' : '?'
			wsUrl += `${separator}clientId=${encodeURIComponent(this.clientId)}`

			// Add authentication if available (backend should also use httpOnly cookies)
			if (isAuthenticated && authState.user) {
				wsUrl += `&userId=${encodeURIComponent(authState.user.id)}`
			}

			this.ws = new WebSocket(wsUrl)
			this.connection.set(this.ws)

			// Set up event handlers
			this.ws.onopen = this.handleOpen.bind(this)
			this.ws.onmessage = this.handleMessage.bind(this)
			this.ws.onerror = this.handleError.bind(this)
			this.ws.onclose = this.handleClose.bind(this)
		} catch (error) {
			console.error('Failed to create WebSocket:', error)
			this.status.set('error')
			this.error.set(error instanceof Error ? error.message : 'Failed to connect')
		}
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		// Cancel any pending reconnection
		if (this.reconnectTimer !== null) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}

		// Prevent reconnection
		this.reconnectAttempts = this.options.maxReconnectAttempts

		if (this.ws) {
			this.ws.close(1000, 'Client disconnect')
			this.ws = null
			this.connection.set(null)
		}

		this.status.set('disconnected')
		this.error.set('')
	}

	/**
	 * Send message to server
	 * Messages are queued if connection is not open
	 */
	send(message: WSMessage): void {
		if (this.ws?.readyState === WebSocket.OPEN) {
			try {
				this.ws.send(JSON.stringify(message))
			} catch (error) {
				console.error('Failed to send WebSocket message:', error)
				this.messageQueue.push(message)
			}
		} else {
			// Queue message for when connection is restored
			this.messageQueue.push(message)
		}
	}

	/**
	 * Register message handler for specific message type
	 */
	on(messageType: string, handler: MessageHandler): () => void {
		if (!this.messageHandlers.has(messageType)) {
			this.messageHandlers.set(messageType, [])
		}
		this.messageHandlers.get(messageType)!.push(handler)

		// Return unsubscribe function
		return () => {
			const handlers = this.messageHandlers.get(messageType)
			if (handlers) {
				const index = handlers.indexOf(handler)
				if (index > -1) {
					handlers.splice(index, 1)
				}
			}
		}
	}

	/**
	 * Handle WebSocket open event
	 */
	private handleOpen(): void {
		console.log('[WS] Connected')
		this.status.set('connected')
		this.error.set('')
		this.reconnectAttempts = 0

		// Register client with server
		this.send({ type: 'register', clientId: this.clientId })

		// Flush message queue
		this.flushQueue()
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	private handleMessage(event: MessageEvent): void {
		try {
			const message = JSON.parse(event.data) as WSMessage

			// Call registered handlers for this message type
			const handlers = this.messageHandlers.get(message.type)
			if (handlers) {
				handlers.forEach((handler) => handler(message))
			}

			// Also call wildcard handlers
			const wildcardHandlers = this.messageHandlers.get('*')
			if (wildcardHandlers) {
				wildcardHandlers.forEach((handler) => handler(message))
			}
		} catch (error) {
			console.error('[WS] Failed to parse message:', error)
		}
	}

	/**
	 * Handle WebSocket error
	 */
	private handleError(event: Event): void {
		console.error('[WS] Error:', event)
		this.status.set('error')
		this.error.set('Connection error occurred')
	}

	/**
	 * Handle WebSocket close event
	 */
	private handleClose(event: CloseEvent): void {
		console.log('[WS] Closed:', event.code, event.reason)
		this.status.set('disconnected')
		this.ws = null
		this.connection.set(null)

		// Attempt reconnection if enabled and not intentionally closed
		if (
			this.options.autoReconnect &&
			this.reconnectAttempts < this.options.maxReconnectAttempts &&
			event.code !== 1000 // 1000 = normal closure
		) {
			this.scheduleReconnect()
		} else if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
			this.error.set('Failed to reconnect. Please refresh the page.')
		}
	}

	/**
	 * Schedule reconnection with exponential backoff
	 */
	private scheduleReconnect(): void {
		this.reconnectAttempts++
		const delay = Math.min(
			this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
			30000 // Max 30 seconds
		)

		console.log(
			`[WS] Reconnecting (${this.reconnectAttempts}/${this.options.maxReconnectAttempts}) in ${delay}ms`
		)

		this.error.set(
			`Connection lost. Reconnecting... (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`
		)

		this.reconnectTimer = window.setTimeout(() => {
			this.connect()
		}, delay)
	}

	/**
	 * Flush queued messages
	 */
	private flushQueue(): void {
		while (this.messageQueue.length > 0) {
			const message = this.messageQueue.shift()!
			this.send(message)
		}
	}

	/**
	 * Get current connection status
	 */
	getStatus(): WSStatus {
		return get(this.status)
	}

	/**
	 * Check if connected
	 */
	isConnected(): boolean {
		return this.ws?.readyState === WebSocket.OPEN
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		this.disconnect()
		this.messageHandlers.clear()
		this.messageQueue = []
	}
}
