<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore, isAuthenticated } from '$lib/stores/auth.svelte'

  let email = ''
  let password = ''
  let error = ''
  let isLoading = false
  let localAuth = false

  // Subscribe to auth state changes
  isAuthenticated.subscribe(value => localAuth = value)

  async function login() {
    if (!email.trim() || !password.trim()) {
      error = 'Please fill in all fields'
      return
    }

    isLoading = true
    error = ''

    try {
      await authStore.login(email.trim(), password)

      // Redirect to dashboard on successful login
      goto('/dashboard')
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed'
    } finally {
      isLoading = false
    }
  }
</script>

<div class="container mx-auto p-6 max-w-md">
  <h1 class="text-3xl font-bold mb-6">Login</h1>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={login} class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium mb-1">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        class="w-full p-2 border rounded {error ? 'border-red-500' : 'border-gray-300'}"
        required
        disabled={isLoading}
        placeholder="Enter your email"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium mb-1">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        class="w-full p-2 border rounded {error ? 'border-red-500' : 'border-gray-300'}"
        required
        disabled={isLoading}
        placeholder="Enter your password"
      />
    </div>

    <button
      type="submit"
      class="w-full p-2 rounded font-medium transition-colors
        {isLoading
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'}"
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      {:else}
        Login
      {/if}
    </button>
  </form>
</div>
