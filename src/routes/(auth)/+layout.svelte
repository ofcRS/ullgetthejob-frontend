<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { authStore, isAuthenticated, isLoading } from '$lib/stores/auth.svelte'

  let authenticated = false
  let loading = true

  // Subscribe to auth state changes
  isAuthenticated.subscribe(value => authenticated = value)
  isLoading.subscribe(value => loading = value)

  onMount(() => {
    // Redirect to dashboard if already authenticated
    if (authenticated && !loading) {
      goto('/dashboard')
    }
  })

  // Reactive statement to handle auth changes
  $: if (authenticated && !loading) {
    goto('/dashboard')
  }
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if !authenticated}
  <slot />
{:else}
  <!-- This won't be shown as we're redirecting, but good to have as fallback -->
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600 mb-4">Redirecting...</p>
    </div>
  </div>
{/if}
