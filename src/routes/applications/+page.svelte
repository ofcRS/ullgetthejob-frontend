<script lang="ts">
  import { onMount } from 'svelte'
  import { applications, applicationStats } from '$lib/stores/applications.store'
  import { getApplications, retryApplication } from '$lib/api/applications.api'
  import ApplicationCard from '$lib/components/ApplicationCard.svelte'

  let isLoading = true
  let filter = 'all'
  let error = ''

  $: filteredApps = filter === 'all'
    ? $applications
    : $applications.filter(a => a.status === filter)

  onMount(async () => {
    await loadApplications()
  })

  async function loadApplications() {
    isLoading = true
    const result = await getApplications()
    if (result.success && result.applications) {
      applications.set(result.applications)
    } else {
      error = result.error || 'Failed to load applications'
    }
    isLoading = false
  }

  async function handleRetry(applicationId: string) {
    const result = await retryApplication(applicationId)
    if (result.success) {
      await loadApplications()
    } else {
      error = result.error || 'Failed to retry application'
    }
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-xl">
  <h1 class="text-3xl font-bold mb-6">Application History</h1>

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
      {error}
    </div>
  {/if}

  <!-- Stats Cards -->
  {#if $applicationStats}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <div class="text-3xl font-bold text-gray-700">{$applicationStats.total}</div>
        <div class="text-sm text-gray-600 mt-1">Total Applications</div>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <div class="text-3xl font-bold text-emerald-600">{$applicationStats.submitted}</div>
        <div class="text-sm text-gray-600 mt-1">Submitted</div>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <div class="text-3xl font-bold text-amber-600">{$applicationStats.pending}</div>
        <div class="text-sm text-gray-600 mt-1">Pending</div>
      </div>
      <div class="p-4 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <div class="text-3xl font-bold text-red-600">{$applicationStats.failed}</div>
        <div class="text-sm text-gray-600 mt-1">Failed</div>
      </div>
    </div>
  {/if}

  <!-- Filter Tabs -->
  <div class="flex gap-2 mb-6">
    <button
      class="px-4 py-2 rounded-md text-sm font-medium transition-colors {filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      on:click={() => filter = 'all'}
    >
      All ({$applications.length})
    </button>
    <button
      class="px-4 py-2 rounded-md text-sm font-medium transition-colors {filter === 'submitted' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      on:click={() => filter = 'submitted'}
    >
      Submitted ({$applicationStats.submitted})
    </button>
    <button
      class="px-4 py-2 rounded-md text-sm font-medium transition-colors {filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      on:click={() => filter = 'pending'}
    >
      Pending ({$applicationStats.pending})
    </button>
    <button
      class="px-4 py-2 rounded-md text-sm font-medium transition-colors {filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      on:click={() => filter = 'failed'}
    >
      Failed ({$applicationStats.failed})
    </button>
  </div>

  <!-- Applications List -->
  {#if isLoading}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading applications...</p>
    </div>
  {:else if filteredApps.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">📄</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
      <p class="text-gray-600 mb-6">Start applying to jobs to see them here</p>
      <a href="/search" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block">
        Search Jobs
      </a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each filteredApps as application (application.id)}
        <ApplicationCard
          {application}
          on:retry={() => handleRetry(application.id)}
        />
      {/each}
    </div>
  {/if}
</div>
