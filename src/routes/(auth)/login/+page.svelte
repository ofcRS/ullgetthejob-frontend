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

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <div class="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
        </svg>
      </div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
      <p class="text-gray-600">Sign in to your account to continue</p>
    </div>

    <!-- Login Form -->
    <div class="card">
      {#if error}
        <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={login} class="space-y-6">
        <div>
          <label for="email" class="label">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            bind:value={email}
            class="input {error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label for="password" class="label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            bind:value={password}
            class="input {error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isLoading}
              <span class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            {:else}
              <span class="flex items-center">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Sign in
              </span>
            {/if}
          </button>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <div class="text-center">
      <p class="text-sm text-gray-600">
        Get the job you deserve with AI-powered applications
      </p>
    </div>
  </div>
</div>
