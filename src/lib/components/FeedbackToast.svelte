<script lang="ts">
  import { notifications, dismissNotification } from '$lib/stores/feedback.store'
  import { fly, fade } from 'svelte/transition'
  import type { FeedbackNotification } from '$lib/types'

  function getIcon(type: FeedbackNotification['type']): string {
    const icons: Record<FeedbackNotification['type'], string> = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      progress: '⏳'
    }
    return icons[type]
  }

  function getColorClasses(type: FeedbackNotification['type']): string {
    const colors: Record<FeedbackNotification['type'], string> = {
      success: 'bg-green-50 border-green-200 text-green-900',
      error: 'bg-red-50 border-red-200 text-red-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      progress: 'bg-purple-50 border-purple-200 text-purple-900'
    }
    return colors[type]
  }

  function getProgressColor(type: FeedbackNotification['type']): string {
    const colors: Record<FeedbackNotification['type'], string> = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600',
      progress: 'bg-purple-600'
    }
    return colors[type]
  }

  function handleDismiss(id: string) {
    dismissNotification(id)
  }

  function handleAction(notification: FeedbackNotification) {
    if (notification.action?.callback) {
      notification.action.callback()
    }
    if (notification.action?.href) {
      window.location.href = notification.action.href
    }
    handleDismiss(notification.id)
  }
</script>

<!-- Toast Container -->
<div class="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
  {#each $notifications as notification (notification.id)}
    <div
      class="pointer-events-auto"
      transition:fly={{ x: 300, duration: 300 }}
    >
      <div class="rounded-lg shadow-lg border-2 {getColorClasses(notification.type)} p-4">
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="text-2xl flex-shrink-0">
            {getIcon(notification.type)}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-semibold text-sm">{notification.title}</h4>
              {#if notification.dismissible}
                <button
                  on:click={() => handleDismiss(notification.id)}
                  class="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              {/if}
            </div>

            <p class="text-sm mt-1 opacity-90">{notification.message}</p>

            <!-- Progress Bar -->
            {#if notification.type === 'progress' && typeof notification.progress === 'number'}
              <div class="mt-2">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{Math.round(notification.progress)}%</span>
                </div>
                <div class="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300 {getProgressColor(
                      notification.type
                    )}"
                    style="width: {notification.progress}%"
                  />
                </div>
              </div>
            {/if}

            <!-- Action Button -->
            {#if notification.action}
              <button
                on:click={() => handleAction(notification)}
                class="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {notification.action.label}
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
