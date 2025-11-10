<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import type { Notification } from '$lib/stores/notifications.store'
  import { removeNotification } from '$lib/stores/notifications.store'

  export let notification: Notification

  $: typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  }

  $: iconColors = {
    success: 'text-emerald-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  }

  function handleClose() {
    removeNotification(notification.id)
  }

  function handleAction() {
    if (notification.action) {
      notification.action.onClick()
      handleClose()
    }
  }
</script>

<div
  class="toast-container {typeStyles[notification.type]}"
  transition:fly={{ y: -20, duration: 300, easing: quintOut }}
  role="alert"
  aria-live={notification.priority === 'urgent' ? 'assertive' : 'polite'}
>
  <div class="flex items-start gap-3">
    <!-- Icon -->
    {#if notification.icon}
      <div class="flex-shrink-0 text-2xl {iconColors[notification.type]}">
        {notification.icon}
      </div>
    {/if}

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-sm mb-1">{notification.title}</h4>
      <p class="text-sm opacity-90">{notification.message}</p>

      <!-- Action Button -->
      {#if notification.action}
        <button
          class="mt-2 text-sm font-medium underline hover:no-underline"
          on:click={handleAction}
        >
          {notification.action.label}
        </button>
      {/if}
    </div>

    <!-- Close Button -->
    <button
      class="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      on:click={handleClose}
      aria-label="Close notification"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <!-- Progress Bar (for auto-closing notifications) -->
  {#if notification.autoClose}
    <div class="progress-bar-container">
      <div
        class="progress-bar {notification.type}"
        style="animation-duration: {notification.duration}ms"
      />
    </div>
  {/if}
</div>

<style>
  .toast-container {
    @apply relative w-full max-w-sm rounded-lg border-2 shadow-lg p-4;
    @apply backdrop-blur-sm bg-opacity-95;
  }

  .progress-bar-container {
    @apply absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg;
  }

  .progress-bar {
    @apply h-full;
    animation-name: shrink;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }

  .progress-bar.success {
    @apply bg-emerald-500;
  }

  .progress-bar.error {
    @apply bg-red-500;
  }

  .progress-bar.warning {
    @apply bg-amber-500;
  }

  .progress-bar.info {
    @apply bg-blue-500;
  }

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
</style>
