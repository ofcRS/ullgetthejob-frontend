import { browser } from '$app/environment'
import { writable, get } from 'svelte/store'

type Job = Record<string, unknown>

class WebSocketStore {
  private ws: WebSocket | null = null
  connected = writable(false)
  jobs = writable<Job[]>([])
  private reconnectTimeout: number | null = null
  private currentFilters: Record<string, unknown> = {}

  connect(url: string) {
    if (!browser) return
    if (this.ws) this.disconnect()

    this.ws = new WebSocket(url)
    this.ws.onopen = () => {
      this.connected.set(true)
      // Resubscribe to filters if we had any
      if (Object.keys(this.currentFilters).length > 0) {
        this.subscribe(this.currentFilters)
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      this.connected.set(false)
      // Auto-reconnect after 5 seconds
      this.reconnectTimeout = window.setTimeout(() => {
        this.connect(url)
      }, 5000)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    this.ws?.close()
    this.ws = null
    this.connected.set(false)
  }

  subscribe(filters: Record<string, unknown>) {
    this.currentFilters = filters
    if (this.ws && get(this.connected)) {
      this.send({ type: 'subscribe', filters })
    }
  }

  private send(data: any) {
    if (this.ws && get(this.connected)) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'connected':
        console.log('WebSocket connected:', data.message)
        break

      case 'subscribed':
        console.log('Subscribed to filters:', data.filters)
        break

      case 'new_jobs':
        if (Array.isArray(data.jobs)) {
          // Add new jobs to the beginning, limit to 100 total
          this.jobs.update(current => [...data.jobs, ...current].slice(0, 100))
        }
        break

      case 'echo':
        // Echo for testing
        console.log('Echo:', data.message)
        break

      default:
        console.log('Unknown message type:', data.type, data)
    }
  }
}

export const websocket = new WebSocketStore()

