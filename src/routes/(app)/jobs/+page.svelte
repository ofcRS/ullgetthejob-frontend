<script lang="ts">
  import { websocket } from '$lib/stores/websocket.svelte'
  import { onMount, onDestroy } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(() => {
    websocket.connect(import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws')
  })

  onDestroy(() => {
    websocket.disconnect()
  })

  function applyToJob(job: any) {
    // TODO: Implement job application logic
    console.log('Apply to job:', job)
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <button
            on:click={() => goto('/dashboard')}
            class="mr-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">Real-time Job Stream</h1>
            <p class="text-sm text-gray-600">Live job opportunities as they become available</p>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="flex items-center">
          <div class="flex items-center space-x-2 px-3 py-2 rounded-lg {websocket.connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
            <div class="w-2 h-2 rounded-full {websocket.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse"></div>
            <span class="text-sm font-medium">
              {websocket.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Stats Bar -->
      <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Jobs in Stream</p>
              <p class="text-lg font-bold text-gray-900">{websocket.jobs.length}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Applied Today</p>
              <p class="text-lg font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-600">Last Updated</p>
              <p class="text-lg font-bold text-gray-900">Just now</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs List -->
      <div class="space-y-4">
        {#each websocket.jobs as job (job.id)}
          <div class="card hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {job.title || 'Untitled Job'}
                  </h3>
                  <div class="flex items-center space-x-2 ml-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  </div>
                </div>

                <div class="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                  {#if job.company}
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      {job.company}
                    </div>
                  {/if}

                  {#if job.area}
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {job.area}
                    </div>
                  {/if}

                  {#if job.salary}
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      {job.salary}
                    </div>
                  {/if}
                </div>

                {#if job.description}
                  <p class="text-gray-700 text-sm mb-4 line-clamp-2">
                    {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                  </p>
                {/if}
              </div>

              <div class="ml-6 flex flex-col space-y-2">
                <button
                  on:click={() => applyToJob(job)}
                  class="btn btn-primary"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Apply Now
                </button>

                <button class="btn btn-secondary">
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Save
                </button>
              </div>
            </div>
          </div>
        {/each}

        {#if websocket.jobs.length === 0}
          <div class="card">
            <div class="text-center py-12">
              <div class="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No jobs in the stream yet</h3>
              <p class="text-gray-500 mb-6">We're constantly monitoring for new opportunities. Jobs will appear here as they become available.</p>

              {#if !websocket.connected}
                <div class="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="text-sm text-yellow-800">Connection lost. Attempting to reconnect...</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
