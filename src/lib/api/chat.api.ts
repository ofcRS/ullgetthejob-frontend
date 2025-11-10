import { apiClient } from './client'
import type { ChatMessage, ChatResponse, ChatContext } from '$lib/types'

export async function sendChatMessage(
  message: string,
  context: ChatContext,
  model?: string
): Promise<ChatResponse> {
  return apiClient.post<ChatResponse>(
    '/api/chat/message',
    {
      message,
      context,
      model
    },
    { timeout: 60000 }
  )
}

export async function streamChatMessage(
  message: string,
  context: ChatContext,
  model: string | undefined,
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  onDone: () => void
): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        context,
        model
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is not readable')
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onDone()
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'chunk' && parsed.content) {
              onChunk(parsed.content)
            } else if (parsed.type === 'error') {
              onError(parsed.error || 'Unknown error')
              return
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to stream chat')
  }
}

export async function getChatHistory(limit = 50): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(`/api/chat/history?limit=${limit}`)
}

export async function clearChatHistory(): Promise<void> {
  return apiClient.delete<void>('/api/chat/history')
}

export async function getChatSuggestions(context: ChatContext): Promise<string[]> {
  return apiClient.post<string[]>('/api/chat/suggestions', { context })
}
