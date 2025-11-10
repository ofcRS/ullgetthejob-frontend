<script lang="ts">
  import { notificationPreferences } from '$lib/stores/notifications.store'
  import { notificationManager } from '$lib/utils/notificationManager'
  import { showSuccess } from '$lib/stores/notifications.store'

  let requesting = false
  let permissionStatus = notificationManager.getPermission()

  async function requestBrowserPermission() {
    requesting = true
    const granted = await notificationManager.requestPermission()
    permissionStatus = notificationManager.getPermission()
    requesting = false

    if (granted) {
      showSuccess('Notifications Enabled', 'You will now receive browser notifications')
    }
  }

  function testNotification() {
    notificationManager.notifySuccess(
      'Test Notification',
      'This is a test notification. If you can see this, notifications are working!',
      {
        action: {
          label: 'Great!',
          onClick: () => console.log('Test notification clicked')
        }
      }
    )
  }

  $: browserSupported = notificationManager.isSupported()
</script>

<svelte:head>
  <title>Notification Settings - UllGetTheJob</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
    <p class="text-gray-600">Configure how and when you receive notifications</p>
  </div>

  <!-- Master Toggle -->
  <div class="card bg-white mb-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h3 class="font-semibold text-lg mb-1">Enable Notifications</h3>
        <p class="text-sm text-gray-600">Turn all notifications on or off</p>
      </div>
      <label class="toggle">
        <input type="checkbox" bind:checked={$notificationPreferences.enabled} />
        <span class="slider"></span>
      </label>
    </div>
  </div>

  {#if $notificationPreferences.enabled}
    <!-- Browser Notifications -->
    <div class="card bg-white mb-6">
      <h3 class="font-semibold text-lg mb-4">Browser Notifications</h3>

      {#if !browserSupported}
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p class="text-amber-800 text-sm">
            ⚠️ Browser notifications are not supported in your browser
          </p>
        </div>
      {:else if permissionStatus === 'denied'}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-800 text-sm font-medium mb-2">
            ❌ Browser notifications are blocked
          </p>
          <p class="text-red-700 text-sm">
            You've blocked notifications for this site. To enable them, click the lock icon in your
            browser's address bar and allow notifications.
          </p>
        </div>
      {:else if permissionStatus === 'granted'}
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <p class="text-emerald-800 text-sm">
            ✅ Browser notifications are enabled. You'll receive notifications even when this tab is
            not active.
          </p>
        </div>
      {:else}
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-800 text-sm mb-3">
            📬 Enable browser notifications to receive alerts even when this tab is not active.
          </p>
          <button
            class="btn btn-primary text-sm"
            disabled={requesting}
            on:click={requestBrowserPermission}
          >
            {requesting ? 'Requesting...' : 'Enable Browser Notifications'}
          </button>
        </div>
      {/if}

      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
        <div class="flex-1">
          <h4 class="font-medium mb-1">Browser Notifications</h4>
          <p class="text-sm text-gray-600">Show system notifications</p>
        </div>
        <label class="toggle">
          <input
            type="checkbox"
            bind:checked={$notificationPreferences.browserNotifications}
            disabled={permissionStatus !== 'granted'}
          />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- In-App Notifications -->
    <div class="card bg-white mb-6">
      <h3 class="font-semibold text-lg mb-4">In-App Notifications</h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">Toast Notifications</h4>
            <p class="text-sm text-gray-600">Show temporary notifications in the app</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.toastNotifications} />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">Notification Sound</h4>
            <p class="text-sm text-gray-600">Play sound for important notifications</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.soundEnabled} />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Notification Types -->
    <div class="card bg-white mb-6">
      <h3 class="font-semibold text-lg mb-4">Notification Types</h3>
      <p class="text-sm text-gray-600 mb-4">Choose which events trigger notifications</p>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">🎉 Interview Requests</h4>
            <p class="text-sm text-gray-600">When companies want to interview you</p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              bind:checked={$notificationPreferences.notifyOnInterviewRequest}
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">📤 Application Submitted</h4>
            <p class="text-sm text-gray-600">When applications are successfully submitted</p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              bind:checked={$notificationPreferences.notifyOnApplicationSubmitted}
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">✨ Customization Complete</h4>
            <p class="text-sm text-gray-600">When CV customization finishes</p>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              bind:checked={$notificationPreferences.notifyOnCustomizationComplete}
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">⚠️ Rate Limit Warnings</h4>
            <p class="text-sm text-gray-600">When approaching application limits</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.notifyOnRateLimit} />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">✅ Success Messages</h4>
            <p class="text-sm text-gray-600">General success notifications</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.notifyOnSuccess} />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">❌ Error Messages</h4>
            <p class="text-sm text-gray-600">Error and failure notifications</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.notifyOnError} />
            <span class="slider"></span>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h4 class="font-medium mb-1">⚠️ Warning Messages</h4>
            <p class="text-sm text-gray-600">Warning notifications</p>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={$notificationPreferences.notifyOnWarning} />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Test Notification -->
    <div class="card bg-white">
      <h3 class="font-semibold text-lg mb-2">Test Notifications</h3>
      <p class="text-sm text-gray-600 mb-4">
        Send a test notification to verify your settings are working
      </p>
      <button class="btn btn-secondary" on:click={testNotification}>
        Send Test Notification
      </button>
    </div>
  {/if}
</div>

<style>
  .card {
    @apply p-6 rounded-lg shadow-md border border-gray-200;
  }

  /* Toggle Switch */
  .toggle {
    @apply relative inline-block w-12 h-6;
  }

  .toggle input {
    @apply opacity-0 w-0 h-0;
  }

  .slider {
    @apply absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all;
  }

  .slider:before {
    @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all;
  }

  input:checked + .slider {
    @apply bg-blue-600;
  }

  input:checked + .slider:before {
    @apply translate-x-6;
  }

  input:disabled + .slider {
    @apply opacity-50 cursor-not-allowed;
  }
</style>
