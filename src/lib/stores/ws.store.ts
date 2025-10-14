import { writable } from 'svelte/store'

export const wsConnection = writable<WebSocket | null>(null)
export const wsStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected')
export const clientId = writable<string>('')

export function connectWebSocket(url: string, id: string) {
  clientId.set(id)
  wsStatus.set('connecting')
  try {
    const ws = new WebSocket(url)
    wsConnection.set(ws)
    ws.onopen = () => {
      wsStatus.set('connected')
      try { ws.send(JSON.stringify({ type: 'register', clientId: id })) } catch {}
    }
    ws.onclose = () => wsStatus.set('disconnected')
  } catch {
    wsStatus.set('disconnected')
  }
}


