<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { QueuedJob } from '$lib/types'

  export let job: QueuedJob

  const dispatch = createEventDispatcher()

  $: statusBadge = getStatusBadge(job.status)

  function getStatusBadge(status: string) {
    const badges = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: '⏳', label: 'Pending' },
      customizing: { color: 'bg-blue-100 text-blue-700', icon: '🎨', label: 'Customizing' },
      ready: { color: 'bg-indigo-100 text-indigo-700', icon: '✅', label: 'Ready' },
      submitting: { color: 'bg-amber-100 text-amber-700', icon: '📤', label: 'Submitting' },
      submitted: { color: 'bg-emerald-100 text-emerald-700', icon: '✓', label: 'Submitted' },
      failed: { color: 'bg-red-100 text-red-700', icon: '❌', label: 'Failed' },
      rate_limited: { color: 'bg-purple-100 text-purple-700', icon: '🕐', label: 'Rate Limited' }
    }
    return badges[status] || badges.pending
  }
</script>

<div class="card hover:shadow-xl transition-shadow duration-200 p-4 bg-white rounded-lg shadow-md border border-gray-200">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{job.job?.title || job.payload?.jobTitle || 'Unknown Position'}</h3>
        <span class="px-3 py-1 rounded-full text-xs font-medium {statusBadge.color}">
          {statusBadge.icon} {statusBadge.label}
        </span>
      </div>

      <p class="text-gray-600 mb-3">{job.job?.company || job.payload?.company || 'Company not specified'}</p>

      <div class="flex items-center gap-4 text-sm text-gray-500">
        {#if job.job?.salary}
          <span>💰 {job.job.salary}</span>
        {/if}
        {#if job.job?.area}
          <span>📍 {job.job.area}</span>
        {/if}
        {#if job.customCv}
          <span class="text-emerald-600">✓ Customized</span>
        {/if}
      </div>

      {#if job.lastError}
        <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Error: {job.lastError}
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2 ml-4">
      {#if job.status === 'pending' || job.status === 'failed'}
        <button
          class="text-sm text-red-600 hover:text-red-700"
          on:click={() => dispatch('remove')}
        >
          Remove
        </button>
      {/if}

      {#if job.customCv}
        <button
          class="text-sm text-blue-600 hover:text-blue-700"
          on:click={() => dispatch('review')}
        >
          Review
        </button>
      {/if}
    </div>
  </div>
</div>
