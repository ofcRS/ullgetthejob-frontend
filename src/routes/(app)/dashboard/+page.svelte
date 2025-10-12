<script lang="ts">
  import { goto } from '$app/navigation'
  import { authStore, user } from '$lib/stores/auth.svelte'

  let currentUser: any = null
  let searchQuery = ''

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

  function onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && searchQuery.trim().length > 0) {
      goto(`/jobs?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }
</script>

<svelte:head>
  <title>Dashboard • UllGetTheJob</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Your job application dashboard overview" />
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-gray-900">Job Application Dashboard</h1>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-600">
            Welcome, <span class="font-medium text-gray-900">{currentUser?.name || currentUser?.email}</span>
          </div>
          <div class="relative hidden md:block">
            <input
              bind:value={searchQuery}
              on:keydown={onSearchKeydown}
              type="search"
              class="input pl-10 w-64"
              placeholder="Search jobs..."
              aria-label="Search jobs"
            />
            <svg class="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button
            on:click={logout}
            class="btn btn-danger"
            aria-label="Logout"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-100 bg-white">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Secondary Navigation">
        <ul class="flex space-x-6 -mb-px overflow-x-auto">
          <li>
            <a href="/dashboard" class="inline-flex items-center py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600" aria-current="page">Overview</a>
          </li>
          <li>
            <a href="/jobs" class="inline-flex items-center py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300">Jobs</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Welcome Section -->
      <div class="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-blue-900 mb-2">Welcome back!</h2>
        <p class="text-blue-700">Ready to find your next opportunity? Let's get started.</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Applications Sent</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Successful</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">In Progress</p>
              <p class="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Browse Jobs -->
        <button class="card hover:shadow-md transition-shadow text-left w-full group" on:click={() => goto('/jobs')} aria-label="Browse jobs">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Browse Jobs</h3>
              <p class="text-gray-600 text-sm">Find new opportunities</p>
            </div>
          </div>
          <div class="flex items-center text-blue-600 text-sm font-medium">
            <span>Start browsing</span>
            <svg class="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>

        <!-- Upload CV -->
        <button class="card hover:shadow-md transition-shadow text-left w-full group" aria-label="Upload CV">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Upload CV</h3>
              <p class="text-gray-600 text-sm">Update your resume</p>
            </div>
          </div>
          <div class="flex items-center text-green-600 text-sm font-medium">
            <span>Upload now</span>
            <svg class="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>

        <!-- View Applications -->
        <button class="card hover:shadow-md transition-shadow text-left w-full group" aria-label="View applications">
          <div class="flex items-center mb-4">
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Applications</h3>
              <p class="text-gray-600 text-sm">Track your progress</p>
            </div>
          </div>
          <div class="flex items-center text-purple-600 text-sm font-medium">
            <span>View details</span>
            <svg class="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </button>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <span class="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <p class="text-gray-500 text-sm">No recent activity</p>
            <p class="text-gray-400 text-xs mt-1">Start by browsing jobs or uploading your CV</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
