<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { queuedJobs, queueStats } from '$lib/stores/queue.store'
  import { rateLimitStatus } from '$lib/stores/rate-limit.store'
  import { getQueue, startBatchCustomize, startAutoApply, removeFromQueue } from '$lib/api/queue.api'
  import { getRateLimitStatus } from '$lib/api/applications.api'
  import QueueJobCard from '$lib/components/QueueJobCard.svelte'
  import RateLimitBanner from '$lib/components/RateLimitBanner.svelte'
  import ProgressBar from '$lib/components/ProgressBar.svelte'
  import { websocketStore } from '$lib/stores/websocket.store'

  let isLoading = true
  let isCustomizing = false
  let isAutoApplying = false
  let error = ''
  let workflowId = ''

  // Stats
  $: pending = $queueStats.pending
  $: customizing = $queueStats.customizing
  $: ready = $queueStats.ready
  $: submitting = $queueStats.submitting
  $: submitted = $queueStats.submitted
  $: failed = $queueStats.failed
  $: rateLimited = $queueStats.rateLimited

  $: totalJobs = $queuedJobs.length
  $: completedJobs = submitted + failed
  $: progressPercent = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0

  let unsubscribe: (() => void) | null = null

  onMount(async () => {
    await loadQueue()
    await loadRateLimitStatus()

    // Listen for WebSocket updates
    unsubscribe = websocketStore.subscribe((message) => {
      if (!message) return

      if (message.type === 'customization_progress') {
        handleCustomizationProgress(message.data)
      } else if (message.type === 'application_progress') {
        handleApplicationProgress(message.data)
      } else if (message.type === 'rate_limit_update') {
        rateLimitStatus.set(message.data)
      }
    })
  })

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function loadQueue() {
    isLoading = true
    const result = await getQueue()
    if (result.success && result.items) {
      queuedJobs.set(result.items)
      if (result.items.length > 0) {
        workflowId = result.items[0].workflowId
      }
    } else {
      error = result.error || 'Failed to load queue'
    }
    isLoading = false
  }

  async function loadRateLimitStatus() {
    const result = await getRateLimitStatus()
    if (result.success && result.rateLimit) {
      rateLimitStatus.set(result.rateLimit)
    }
  }

  async function handleCustomizeAll() {
    if (!workflowId) {
      error = 'No workflow ID found'
      return
    }

    isCustomizing = true
    error = ''

    const result = await startBatchCustomize(workflowId)
    if (!result.success) {
      error = result.error || 'Failed to start customization'
      isCustomizing = false
    }
    // isCustomizing will be set to false by WebSocket update
  }

  async function handleStartAutoApply() {
    if (!workflowId) {
      error = 'No workflow ID found'
      return
    }

    if (ready === 0) {
      error = 'No jobs ready to apply. Please customize jobs first.'
      return
    }

    isAutoApplying = true
    error = ''

    const result = await startAutoApply(workflowId)
    if (!result.success) {
      error = result.error || 'Failed to start auto-apply'
      isAutoApplying = false
    }
  }

  async function handleRemove(jobId: string) {
    const result = await removeFromQueue(jobId)
    if (result.success) {
      await loadQueue()
    } else {
      error = result.error || 'Failed to remove job'
    }
  }

  function handleCustomizationProgress(data: any) {
    // Reload queue to get updated statuses
    loadQueue()

    if (data.status === 'completed') {
      isCustomizing = false
    }
  }

  function handleApplicationProgress(data: any) {
    // Reload queue to get updated statuses
    loadQueue()
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">Application Queue</h1>
      <p class="text-gray-600">Manage and auto-apply to multiple jobs</p>
    </div>

    <div class="flex gap-3">
      <button
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={pending === 0 || isCustomizing}
        on:click={handleCustomizeAll}
      >
        {#if isCustomizing}
          Customizing... ({customizing}/{pending + customizing})
        {:else}
          Customize All ({pending})
        {/if}
      </button>

      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={ready === 0 || isAutoApplying || !$rateLimitStatus?.canApply}
        on:click={handleStartAutoApply}
      >
        {#if isAutoApplying}
          Auto-Applying...
        {:else}
          Start Auto-Apply ({ready})
        {/if}
      </button>
    </div>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
      {error}
    </div>
  {/if}

  <!-- Rate Limit Banner -->
  {#if $rateLimitStatus}
    <RateLimitBanner
      tokens={$rateLimitStatus.tokens}
      capacity={$rateLimitStatus.capacity}
      nextRefill={$rateLimitStatus.nextRefill}
      canApply={$rateLimitStatus.canApply}
    />
  {/if}

  <!-- Progress Overview -->
  {#if totalJobs > 0}
    <div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Progress</h2>
        <span class="text-sm text-gray-600">{completedJobs}/{totalJobs} jobs processed</span>
      </div>

      <ProgressBar progress={progressPercent} />

      <div class="grid grid-cols-7 gap-4 mt-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-700">{pending}</div>
          <div class="text-xs text-gray-500 mt-1">⏳ Pending</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{customizing}</div>
          <div class="text-xs text-gray-500 mt-1">🎨 Customizing</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-indigo-600">{ready}</div>
          <div class="text-xs text-gray-500 mt-1">✅ Ready</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-amber-600">{submitting}</div>
          <div class="text-xs text-gray-500 mt-1">📤 Submitting</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-600">{submitted}</div>
          <div class="text-xs text-gray-500 mt-1">✓ Submitted</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">{failed}</div>
          <div class="text-xs text-gray-500 mt-1">❌ Failed</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{rateLimited}</div>
          <div class="text-xs text-gray-500 mt-1">🕐 Waiting</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Queue Items -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading queue...</p>
    </div>
  {:else if $queuedJobs.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">📭</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">Queue is empty</h3>
      <p class="text-gray-600 mb-6">Add jobs from the search page to get started</p>
      <a href="/search" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block">
        Search Jobs
      </a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each $queuedJobs as job (job.id)}
        <QueueJobCard
          {job}
          on:remove={() => handleRemove(job.id)}
        />
      {/each}
    </div>
  {/if}
</div>
