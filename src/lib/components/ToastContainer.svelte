<script lang="ts">
  import { notifications, notificationPreferences } from '$lib/stores/notifications.store'
  import Toast from './Toast.svelte'

  // Only show toast notifications that haven't been dismissed
  $: toastNotifications = $notificationPreferences.toastNotifications
    ? $notifications.filter((n) => n.autoClose !== false || !n.read).slice(-3)
    : []
</script>

<!-- Toast Container - Fixed position at top right -->
<div class="toast-stack" aria-live="polite">
  {#each toastNotifications as notification (notification.id)}
    <Toast {notification} />
  {/each}
</div>

<style>
  .toast-stack {
    @apply fixed top-4 right-4 z-50;
    @apply flex flex-col gap-3;
    @apply pointer-events-none;
    max-width: calc(100vw - 2rem);
  }

  .toast-stack :global(.toast-container) {
    @apply pointer-events-auto;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .toast-stack {
      @apply top-4 left-4 right-4;
    }
  }
</style>
