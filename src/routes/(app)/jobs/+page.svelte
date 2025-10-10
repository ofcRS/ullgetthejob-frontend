<script lang="ts">
  import { websocket } from '$lib/stores/websocket.svelte'
  import { onMount, onDestroy } from 'svelte'

  onMount(() => {
    websocket.connect(import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws')
  })

  onDestroy(() => {
    websocket.disconnect()
  })
</script>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Real-time Job Stream</h1>

  <div class="mb-4">
    <span class="inline-flex items-center gap-2">
      <div class="w-2 h-2 rounded-full {websocket.connected ? 'bg-green-500' : 'bg-red-500'}"></div>
      {websocket.connected ? 'Connected' : 'Disconnected'}
    </span>
  </div>

  <div class="grid gap-4">
    {#each websocket.jobs as job (job.id)}
      <div class="border p-4 rounded">
        <h3 class="font-semibold">{job.title || 'Untitled Job'}</h3>
        <p class="text-gray-600">{job.company || 'Unknown Company'}</p>
        <p class="text-sm text-gray-500">{job.area || 'Location not specified'}</p>
      </div>
    {/each}

    {#if websocket.jobs.length === 0}
      <p class="text-gray-500 text-center py-8">No jobs yet. Waiting for new jobs...</p>
    {/if}
  </div>
</div>
