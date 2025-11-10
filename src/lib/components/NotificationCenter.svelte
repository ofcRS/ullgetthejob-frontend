<script lang="ts">
  import { slide } from 'svelte/transition'
  import { clickOutside } from '$lib/utils/clickOutside'
  import {
    sortedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    clearReadNotifications
  } from '$lib/stores/notifications.store'

  let isOpen = false

  function toggleDropdown() {
    isOpen = !isOpen
  }

  function closeDropdown() {
    isOpen = false
  }

  function handleNotificationClick(id: string) {
    markAsRead(id)
  }

  function handleMarkAllRead() {
    markAllAsRead()
  }

  function handleClearAll() {
    clearAllNotifications()
    closeDropdown()
  }

  function handleClearRead() {
    clearReadNotifications()
  }

  function getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  $: hasNotifications = $sortedNotifications.length > 0
  $: hasUnread = $unreadCount > 0
</script>

<div class="notification-center" use:clickOutside={closeDropdown}>
  <!-- Bell Icon Button -->
  <button
    class="bell-button"
    class:has-unread={hasUnread}
    on:click={toggleDropdown}
    aria-label="Notifications"
    aria-expanded={isOpen}
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>

    <!-- Unread Badge -->
    {#if hasUnread}
      <span class="badge" transition:slide={{ duration: 200 }}>
        {$unreadCount > 99 ? '99+' : $unreadCount}
      </span>
    {/if}
  </button>

  <!-- Dropdown -->
  {#if isOpen}
    <div class="dropdown" transition:slide={{ duration: 200 }}>
      <!-- Header -->
      <div class="dropdown-header">
        <h3 class="font-semibold text-lg">Notifications</h3>
        <div class="flex items-center gap-2">
          {#if hasUnread}
            <button class="text-sm text-blue-600 hover:text-blue-700" on:click={handleMarkAllRead}>
              Mark all read
            </button>
          {/if}
          {#if hasNotifications}
            <button class="text-sm text-gray-600 hover:text-gray-700" on:click={handleClearRead}>
              Clear read
            </button>
          {/if}
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        {#if hasNotifications}
          {#each $sortedNotifications as notification (notification.id)}
            <div
              class="notification-item"
              class:unread={!notification.read}
              on:click={() => handleNotificationClick(notification.id)}
              on:keypress={(e) => e.key === 'Enter' && handleNotificationClick(notification.id)}
              role="button"
              tabindex="0"
            >
              <!-- Priority Indicator -->
              {#if notification.priority === 'urgent' || notification.priority === 'high'}
                <div class="priority-indicator {notification.priority}" />
              {/if}

              <div class="flex items-start gap-3 w-full">
                <!-- Icon -->
                {#if notification.icon}
                  <div class="flex-shrink-0 text-xl">
                    {notification.icon}
                  </div>
                {/if}

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h4 class="font-semibold text-sm">{notification.title}</h4>
                    <span class="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700">{notification.message}</p>

                  <!-- Action Button -->
                  {#if notification.action}
                    <button
                      class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                      on:click={(e) => {
                        e.stopPropagation()
                        notification.action?.onClick()
                      }}
                    >
                      {notification.action.label} →
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <!-- Empty State -->
          <div class="empty-state">
            <div class="text-4xl mb-2">🔔</div>
            <p class="text-gray-600 font-medium">No notifications</p>
            <p class="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      {#if hasNotifications}
        <div class="dropdown-footer">
          <button class="text-sm text-red-600 hover:text-red-700" on:click={handleClearAll}>
            Clear all notifications
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .notification-center {
    @apply relative;
  }

  .bell-button {
    @apply relative p-2 rounded-lg;
    @apply text-gray-600 hover:text-gray-900 hover:bg-gray-100;
    @apply transition-colors duration-200;
  }

  .bell-button.has-unread {
    @apply text-blue-600;
  }

  .badge {
    @apply absolute -top-1 -right-1;
    @apply bg-red-500 text-white text-xs font-bold;
    @apply rounded-full min-w-[20px] h-5 px-1.5;
    @apply flex items-center justify-center;
    @apply shadow-md;
  }

  .dropdown {
    @apply absolute top-full right-0 mt-2;
    @apply w-96 max-h-[32rem];
    @apply bg-white rounded-lg shadow-xl border border-gray-200;
    @apply overflow-hidden;
    @apply z-50;
  }

  @media (max-width: 640px) {
    .dropdown {
      @apply fixed inset-x-4 top-16 w-auto;
    }
  }

  .dropdown-header {
    @apply flex items-center justify-between;
    @apply px-4 py-3 border-b border-gray-200;
    @apply bg-gray-50;
  }

  .notifications-list {
    @apply max-h-96 overflow-y-auto;
  }

  .notification-item {
    @apply relative px-4 py-3 border-b border-gray-100;
    @apply hover:bg-gray-50 transition-colors cursor-pointer;
  }

  .notification-item.unread {
    @apply bg-blue-50 hover:bg-blue-100;
  }

  .priority-indicator {
    @apply absolute left-0 top-0 bottom-0 w-1;
  }

  .priority-indicator.urgent {
    @apply bg-red-500;
  }

  .priority-indicator.high {
    @apply bg-orange-500;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center;
    @apply py-12 px-4;
    @apply text-center;
  }

  .dropdown-footer {
    @apply px-4 py-3 border-t border-gray-200;
    @apply bg-gray-50;
    @apply text-center;
  }

  /* Custom scrollbar */
  .notifications-list::-webkit-scrollbar {
    @apply w-2;
  }

  .notifications-list::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  .notifications-list::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }

  .notifications-list::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }
</style>
