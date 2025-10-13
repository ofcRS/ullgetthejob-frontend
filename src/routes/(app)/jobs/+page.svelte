<script lang="ts">
  import { goto } from '$app/navigation'
  import CVUpload from '$lib/components/CVUpload.svelte'
  import JobStream from '$lib/components/JobStream.svelte'
  import JobSearch from '$lib/components/JobSearch.svelte'
  
  let uploadedCV: any = null
  let showCVUpload = false
  let searchFilters = {}
  let autoApply = false
  
  function handleCVUploaded(event: CustomEvent) {
    uploadedCV = event.detail.cv
    showCVUpload = false
  }
  
  function handleSearchStarted(event: CustomEvent) {
    searchFilters = event.detail.searchParams
  }
  
  function handleJobApplied(event: CustomEvent) {
    console.log('Job applied:', event.detail)
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

        <!-- Navigation -->
        <div class="flex items-center space-x-4">
          <button
            on:click={() => goto('/dashboard')}
            class="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- CV Upload Section -->
      {#if !uploadedCV}
        <div class="mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Upload Your CV</h2>
                <p class="text-sm text-gray-600 mt-1">Upload your resume to start applying to jobs automatically</p>
              </div>
              {#if !showCVUpload}
                <button
                  on:click={() => showCVUpload = true}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload CV
                </button>
              {/if}
            </div>
            
            {#if showCVUpload}
              <CVUpload on:uploaded={handleCVUploaded} />
            {/if}
          </div>
        </div>
      {:else}
        <div class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="font-medium text-green-900">CV uploaded: {uploadedCV.name}</p>
              <p class="text-sm text-green-700">Ready to apply to jobs</p>
            </div>
          </div>
          <button
            on:click={() => { uploadedCV = null; showCVUpload = true }}
            class="text-sm text-green-700 hover:text-green-800 font-medium"
          >
            Change CV
          </button>
        </div>
      {/if}
      
      <!-- Search Filters -->
      <div class="mb-6">
        <JobSearch on:searchStarted={handleSearchStarted} bind:autoApply />
      </div>
      
      <!-- Job Stream -->
      <JobStream 
        filters={searchFilters} 
        {autoApply}
        on:applied={handleJobApplied}
      />
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
