<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  onMount(() => {
    // Get OAuth code and state from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      // OAuth error from HH.ru
      console.error('OAuth error:', error)
      goto(`/upload?error=${encodeURIComponent(error)}`)
      return
    }

    if (!code) {
      // Missing code parameter
      console.error('Missing OAuth code')
      goto('/upload?error=missing_code')
      return
    }

    // Redirect to API callback with code and state
    const callbackUrl = new URL(`${API}/api/auth/hh/callback`)
    callbackUrl.searchParams.set('code', code)
    if (state) {
      callbackUrl.searchParams.set('state', state)
    }

    // Use window.location to ensure cookies are properly set
    window.location.href = callbackUrl.toString()
  })
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
    <h2 class="text-xl font-semibold text-gray-900">Connecting to HH.ru...</h2>
    <p class="text-gray-600 mt-2">Please wait while we complete the authentication</p>
  </div>
</div>
