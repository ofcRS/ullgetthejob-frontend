<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  let status = 'Connecting to HH.ru...'
  let error = ''

  onMount(async () => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) {
      error = 'Missing authorization code'
      status = ''
      return
    }
    try {
      const res = await fetch(`${API}/api/auth/hh/callback?code=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.success) {
        status = 'HH.ru connected!'
        setTimeout(() => goto('/upload'), 700)
      } else {
        error = data.error || 'Failed to connect HH.ru'
        status = ''
      }
    } catch (e) {
      error = 'Network error during HH callback'
      status = ''
    }
  })
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-sm">
  <h1 class="text-2xl font-bold mb-4">HH.ru Connection</h1>
  {#if status}
    <p class="text-gray-700">{status}</p>
  {/if}
  {#if error}
    <p class="text-red-600">{error}</p>
  {/if}
</div>


