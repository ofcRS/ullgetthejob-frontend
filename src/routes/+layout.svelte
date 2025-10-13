<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { websocket } from '$lib/stores/websocket.svelte'
  import { browser } from '$app/environment'

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'

  onMount(() => {
    if (browser) {
      websocket.connect(WS_URL)
    }
    return () => websocket.disconnect()
  })
</script>

<slot />
