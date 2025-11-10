<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { ApplicationStatus } from '$lib/types'

  export let application: ApplicationStatus

  const dispatch = createEventDispatcher()

  $: statusColor = getStatusColor(application.status)
  $: formattedDate = application.submittedAt
    ? new Date(application.submittedAt).toLocaleDateString()
    : new Date(application.createdAt).toLocaleDateString()

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'text-amber-600 bg-amber-50',
      submitted: 'text-emerald-600 bg-emerald-50',
      failed: 'text-red-600 bg-red-50',
      rate_limited: 'text-purple-600 bg-purple-50'
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
  }
</script>

<div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
        <span class="px-3 py-1 rounded-full text-xs font-medium {statusColor}">
          {application.status}
        </span>
      </div>

      <p class="text-gray-600 mb-2">{application.company}</p>

      <div class="text-sm text-gray-500">
        {#if application.submittedAt}
          Submitted on {formattedDate}
        {:else}
          Created on {formattedDate}
        {/if}
      </div>

      {#if application.errorMessage}
        <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {application.errorMessage}
        </div>
      {/if}

      {#if application.hhStatus}
        <div class="mt-2 text-sm text-blue-600">
          HH.ru Status: {application.hhStatus}
        </div>
      {/if}
    </div>

    {#if application.status === 'failed'}
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        on:click={() => dispatch('retry')}
      >
        Retry
      </button>
    {/if}
  </div>
</div>
