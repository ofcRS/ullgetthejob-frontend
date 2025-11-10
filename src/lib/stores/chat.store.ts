import { writable, derived, get } from 'svelte/store'
import type { ChatMessage, ChatContext } from '$lib/types'
import { uploadedCv, customizedCv } from './cv.store'
import { selectedJob } from './jobs.store'
import { applications } from './applications.store'

function createPersistentStore<T>(key: string, initial: T) {
  const store = writable<T>(initial)

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      try {
        store.set(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored data:', e)
      }
    }

    store.subscribe((value) => {
      sessionStorage.setItem(key, JSON.stringify(value))
    })
  }

  return store
}

// Chat messages history
export const chatHistory = createPersistentStore<ChatMessage[]>('chat_history', [])

// Current chat input
export const chatInput = writable<string>('')

// Streaming state
export const isStreaming = writable<boolean>(false)

// Current streaming message
export const streamingMessage = writable<string>('')

// Chat context - derived from other stores
export const chatContext = derived(
  [uploadedCv, customizedCv, selectedJob, applications],
  ([$uploadedCv, $customizedCv, $selectedJob, $applications]) => {
    const context: ChatContext = {
      cv: $customizedCv || $uploadedCv,
      job: $selectedJob,
      applications: $applications.slice(0, 10), // Last 10 applications
      recentActivity: []
    }

    // Add recent activity
    const recentApps = $applications
      .filter(app => app.submittedAt)
      .slice(0, 5)
      .map(app => `Applied to ${app.jobTitle} at ${app.company}`)

    context.recentActivity = recentApps

    return context
  }
)

// Suggested prompts
export const suggestedPrompts = writable<string[]>([
  'How can I improve my CV?',
  'What jobs match my skills best?',
  'Help me write a cover letter',
  'Analyze my application success rate',
  'What skills should I learn?'
])

// Chat functions
export function addMessage(message: ChatMessage) {
  chatHistory.update(messages => [...messages, message])
}

export function addUserMessage(content: string) {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
    context: get(chatContext)
  }
  addMessage(message)
  return message
}

export function addAssistantMessage(content: string) {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString()
  }
  addMessage(message)
  return message
}

export function clearChat() {
  chatHistory.set([])
  streamingMessage.set('')
  chatInput.set('')
}

export function updateLastMessage(content: string) {
  chatHistory.update(messages => {
    if (messages.length === 0) return messages
    const lastMessage = messages[messages.length - 1]
    return [...messages.slice(0, -1), { ...lastMessage, content }]
  })
}
