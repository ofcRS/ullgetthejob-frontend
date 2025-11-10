<script lang="ts">
  import { onMount, tick } from 'svelte'
  import {
    chatHistory,
    chatInput,
    isStreaming,
    streamingMessage,
    chatContext,
    suggestedPrompts,
    addUserMessage,
    addAssistantMessage,
    clearChat
  } from '$lib/stores/chat.store'
  import { selectedModel } from '$lib/stores/cv.store'
  import { streamChatMessage } from '$lib/api/chat.api'
  import { showError } from '$lib/stores/feedback.store'
  import DOMPurify from 'isomorphic-dompurify'

  let chatContainer: HTMLDivElement
  let inputField: HTMLTextAreaElement
  let autoScroll = true

  async function handleSend() {
    const message = $chatInput.trim()
    if (!message || $isStreaming) return

    // Add user message
    addUserMessage(message)
    $chatInput = ''

    // Start streaming
    $isStreaming = true
    $streamingMessage = ''

    try {
      await streamChatMessage(
        message,
        $chatContext,
        $selectedModel,
        // onChunk
        (chunk: string) => {
          $streamingMessage += chunk
          if (autoScroll) {
            scrollToBottom()
          }
        },
        // onError
        (error: string) => {
          showError('Chat Error', error)
          $isStreaming = false
          $streamingMessage = ''
        },
        // onDone
        () => {
          if ($streamingMessage) {
            addAssistantMessage($streamingMessage)
          }
          $isStreaming = false
          $streamingMessage = ''
          scrollToBottom()
        }
      )
    } catch (error) {
      showError('Chat Error', error instanceof Error ? error.message : 'Failed to send message')
      $isStreaming = false
      $streamingMessage = ''
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function useSuggestedPrompt(prompt: string) {
    $chatInput = prompt
    inputField.focus()
  }

  async function scrollToBottom() {
    await tick()
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  }

  function handleScroll() {
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      autoScroll = scrollHeight - scrollTop - clientHeight < 100
    }
  }

  onMount(() => {
    scrollToBottom()
  })

  $: if ($chatHistory.length > 0) {
    scrollToBottom()
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }
</script>

<div class="flex flex-col h-full bg-white rounded-lg shadow-lg">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b">
    <div>
      <h2 class="text-xl font-bold text-gray-900">AI Assistant</h2>
      <p class="text-sm text-gray-500">Context-aware job search help</p>
    </div>
    <button
      on:click={clearChat}
      class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
      disabled={$chatHistory.length === 0}
    >
      Clear Chat
    </button>
  </div>

  <!-- Messages -->
  <div
    bind:this={chatContainer}
    on:scroll={handleScroll}
    class="flex-1 overflow-y-auto p-4 space-y-4"
  >
    {#if $chatHistory.length === 0}
      <div class="text-center py-8">
        <div class="text-gray-400 mb-4">
          <svg
            class="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">Start a conversation with the AI assistant</p>

        <!-- Suggested prompts -->
        <div class="space-y-2">
          {#each $suggestedPrompts as prompt}
            <button
              on:click={() => useSuggestedPrompt(prompt)}
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {prompt}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      {#each $chatHistory as message}
        <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div
            class="max-w-[80%] {message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'} rounded-lg px-4 py-2"
          >
            <div class="prose prose-sm max-w-none {message.role === 'user' ? 'prose-invert' : ''}">
              {@html DOMPurify.sanitize(message.content, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'],
                ALLOWED_ATTR: []
              })}
            </div>
            <div
              class="text-xs {message.role === 'user'
                ? 'text-blue-200'
                : 'text-gray-500'} mt-1"
            >
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      {/each}

      {#if $isStreaming && $streamingMessage}
        <div class="flex justify-start">
          <div class="max-w-[80%] bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
            <div class="prose prose-sm max-w-none">
              {@html DOMPurify.sanitize($streamingMessage, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'],
                ALLOWED_ATTR: []
              })}
            </div>
            <div class="flex items-center space-x-1 mt-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Input -->
  <div class="border-t p-4">
    <div class="flex space-x-2">
      <textarea
        bind:this={inputField}
        bind:value={$chatInput}
        on:keydown={handleKeyDown}
        placeholder="Ask me anything about your job search..."
        rows="2"
        disabled={$isStreaming}
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        on:click={handleSend}
        disabled={!$chatInput.trim() || $isStreaming}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {#if $isStreaming}
          <svg
            class="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        {:else}
          Send
        {/if}
      </button>
    </div>
    <div class="text-xs text-gray-500 mt-2">
      Press Enter to send, Shift+Enter for new line
    </div>
  </div>
</div>

<style>
  .delay-100 {
    animation-delay: 0.1s;
  }
  .delay-200 {
    animation-delay: 0.2s;
  }
</style>
