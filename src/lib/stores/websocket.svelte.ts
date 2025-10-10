import { browser } from '$app/environment'

type Job = Record<string, unknown>

class WebSocketStore {
  private ws: WebSocket | null = $state<WebSocket | null>(null)
  connected = $state(false)
  jobs = $state<Job[]>([])

  connect(url: string) {
    if (!browser) return
    this.ws = new WebSocket(url)
    this.ws.onopen = () => { this.connected = true }
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.type === 'new_jobs' && Array.isArray(data.jobs)) {
          this.jobs = [...data.jobs, ...this.jobs].slice(0, 100)
        }
      } catch {}
    }
    this.ws.onclose = () => {
      this.connected = false
      setTimeout(() => this.connect(url), 5000)
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
    this.connected = false
  }
}

export const websocket = new WebSocketStore()

