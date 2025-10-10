<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore, user } from '$lib/stores/auth.svelte'

  let currentUser: any = null

  // Subscribe to user state changes
  user.subscribe(value => currentUser = value)

  async function logout() {
    try {
      await authStore.logout()
      goto('/login')
    } catch (error) {
      // Even if logout fails, redirect to login
      console.error('Logout error:', error)
      goto('/login')
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <button
      on:click={logout}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  </div>

  <div class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4">Welcome back, {currentUser?.name || currentUser?.email}!</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h3 class="font-medium text-blue-900 mb-2">Quick Actions</h3>
        <div class="space-y-2">
          <a href="/jobs" class="block bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
            Browse Jobs
          </a>
        </div>
      </div>

      <div class="bg-green-50 p-4 rounded-lg">
        <h3 class="font-medium text-green-900 mb-2">Your Applications</h3>
        <p class="text-green-700 text-sm">Track your job applications here.</p>
      </div>
    </div>
  </div>
</div>
