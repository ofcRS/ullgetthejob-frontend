<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import '../app.css'
  import StepIndicator from '$lib/components/StepIndicator.svelte'
  import { page } from '$app/stores'
  import GlobalSettings from '$lib/components/GlobalSettings.svelte'
  import { connectWebSocket, disconnectWebSocket } from '$lib/stores/websocket.store'

  const USER_ID = 'test_user' // TODO: Replace with actual user ID from auth

  $: currentStep = (() => {
    const p = $page.url.pathname
    if (p.startsWith('/upload')) return 1
    if (p.startsWith('/search')) return 2
    if (p.startsWith('/jobs')) return 3
    if (p.startsWith('/application')) return 4
    return 1
  })()

  onMount(() => {
    // Connect WebSocket for real-time updates
    connectWebSocket(USER_ID)
  })

  onDestroy(() => {
    disconnectWebSocket()
  })
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <div class="container mx-auto px-4 py-6 max-w-screen-2xl">
    <StepIndicator {currentStep} />
    <slot />
  </div>
  <GlobalSettings />
  </div>