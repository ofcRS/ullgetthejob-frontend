<script lang="ts">
  import { jobs, isSearching, selectedJob } from '$lib/stores/jobs.store'
  import JobCard from '$lib/components/JobCard.svelte'
  import { searchJobs } from '$lib/api/jobs.api'
  import { uploadedCv, clearCustomization } from '$lib/stores/cv.store'
  import { selectedJobIds } from '$lib/stores/queue.store'
  import { addToQueue } from '$lib/api/queue.api'
  import { goto } from '$app/navigation'
  import { normalizeJob } from '$lib/utils/job'

  let query = ''
  let area = '1'
  let schedule = 'remote'
  let error = ''
  let selectMode = false
  let isAddingToQueue = false

  async function runSearch() {
    error = ''

    // Validate query
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      error = 'Please enter a search term'
      return
    }

    if (trimmedQuery.length < 2) {
      error = 'Search term must be at least 2 characters'
      return
    }

    if (trimmedQuery.length > 200) {
      error = 'Search term is too long (maximum 200 characters)'
      return
    }

    // Basic XSS prevention - check for suspicious patterns
    const suspiciousPatterns = /<script|javascript:|onerror=|onclick=/i
    if (suspiciousPatterns.test(trimmedQuery)) {
      error = 'Search term contains invalid characters'
      return
    }

    isSearching.set(true)
    jobs.set([])

    try {
      const res = await searchJobs({
        text: trimmedQuery,
        area: area || undefined,
        schedule: schedule || undefined
      })

      if (res.success) {
        const normalizedJobs = res.jobs.map((job) => normalizeJob(job))
        jobs.set(normalizedJobs)

        if (normalizedJobs.length === 0) {
          error = 'No jobs found. Try different search terms or location.'
        }
      } else {
        error = res.error || 'Search failed. Please try again.'
      }
    } catch (err) {
      console.error('Search error:', err)
      error = 'Network error. Please check your connection and try again.'
    } finally {
      isSearching.set(false)
    }
  }

  $: selectedCvInfo = $uploadedCv ? {
    name: `${$uploadedCv.firstName || ''} ${$uploadedCv.lastName || ''}`.trim(),
    title: $uploadedCv.title,
    skillCount: $uploadedCv.skills?.length || 0
  } : null

  function chooseJob(job: any) {
    if (!$uploadedCv) {
      error = 'Please upload your CV before selecting a job. Go to the Upload page to get started.'
      return
    }

    clearCustomization()
    const normalized = normalizeJob(job)
    selectedJob.set(normalized)
    jobs.update((items) => items.map((item) => (item.id === normalized.id ? normalized : item)))
    goto('/jobs')
  }

  function toggleSelectMode() {
    selectMode = !selectMode
    if (!selectMode) {
      selectedJobIds.set(new Set())
    }
  }

  function toggleJobSelection(jobId: string) {
    selectedJobIds.update(ids => {
      const newIds = new Set(ids)
      if (newIds.has(jobId)) {
        newIds.delete(jobId)
      } else {
        newIds.add(jobId)
      }
      return newIds
    })
  }

  function selectAll() {
    selectedJobIds.set(new Set($jobs.map(j => j.id)))
  }

  function clearSelection() {
    selectedJobIds.set(new Set())
  }

  async function addSelectedToQueue() {
    if (!$uploadedCv) {
      error = 'Please upload your CV first'
      return
    }

    if ($selectedJobIds.size === 0) {
      error = 'No jobs selected'
      return
    }

    isAddingToQueue = true
    error = ''

    // We need to get the CV ID - for now we'll use a placeholder
    // In a real implementation, you'd have the CV ID stored with the uploadedCv
    const cvId = 'default-cv-id' // TODO: Get actual CV ID from uploadedCv

    const result = await addToQueue(
      Array.from($selectedJobIds),
      cvId
    )

    if (result.success) {
      selectedJobIds.set(new Set())
      selectMode = false
      goto('/queue')
    } else {
      error = result.error || 'Failed to add jobs to queue'
    }

    isAddingToQueue = false
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-4">Search Jobs</h1>

  {#if !$uploadedCv}
    <div class="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">⚠️</div>
        <div class="flex-1">
          <h3 class="font-semibold text-amber-900 mb-1">CV Required</h3>
          <p class="text-sm text-amber-800">Please upload your CV first to customize applications for specific jobs.</p>
        </div>
        <a href="/upload" class="btn btn-primary whitespace-nowrap">Upload CV</a>
      </div>
    </div>
  {:else if selectedCvInfo}
    <div class="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">👤</div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">Searching for: {selectedCvInfo.name || 'Unnamed'}</h3>
          <p class="text-sm text-gray-600">{selectedCvInfo.title} • {selectedCvInfo.skillCount} skills identified</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="card p-8">
    <h2 class="text-2xl font-bold mb-6">Find Your Next Opportunity</h2>
    <div class="space-y-4 mb-6">
      <div>
        <label class="label" for="search-query">Job Title or Keywords</label>
        <div class="relative">
          <input id="search-query" type="text" bind:value={query} placeholder="e.g. Full Stack Developer, React Engineer" class="input" on:keydown={(e) => e.key==='Enter' && runSearch()} />
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="label" for="search-area">Location</label>
          <div class="relative">
            <select id="search-area" bind:value={area} class="input">
              <option value="">Any Location</option>
              <option value="1">Moscow</option>
              <option value="2">Saint Petersburg</option>
              <option value="113">All Russia</option>
            </select>
          </div>
        </div>
        <div>
          <label class="label" for="search-schedule">Work Schedule</label>
          <div class="relative">
            <select id="search-schedule" bind:value={schedule} class="input">
              <option value="">Any Schedule</option>
              <option value="remote">Remote</option>
              <option value="fullDay">Full Day</option>
              <option value="shift">Shift</option>
              <option value="flexible">Flexible</option>
              <option value="flyInFlyOut">Fly-in Fly-out</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-primary w-full" disabled={$isSearching || !query.trim()} on:click={runSearch}>
      {$isSearching ? 'Searching...' : 'Search Jobs'}
    </button>
  </div>

  {#if error}
    <p class="text-sm text-red-600 mt-3">{error}</p>
  {/if}

  {#if $jobs.length > 0}
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <h3 class="text-xl font-semibold">{$jobs.length} jobs found</h3>

          <button
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            on:click={toggleSelectMode}
          >
            {selectMode ? 'Cancel' : 'Select Multiple'}
          </button>

          {#if selectMode}
            <span class="text-sm text-gray-600">
              {$selectedJobIds.size} selected
            </span>

            <button
              class="text-sm text-blue-600 hover:text-blue-700"
              on:click={selectAll}
            >
              Select All
            </button>

            {#if $selectedJobIds.size > 0}
              <button
                class="text-sm text-red-600 hover:text-red-700"
                on:click={clearSelection}
              >
                Clear
              </button>
            {/if}
          {/if}
        </div>

        {#if selectMode && $selectedJobIds.size > 0}
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={isAddingToQueue}
            on:click={addSelectedToQueue}
          >
            {isAddingToQueue ? 'Adding...' : `Add ${$selectedJobIds.size} to Queue`}
          </button>
        {/if}
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        {#each $jobs as job}
          <button
            class="text-left group transform hover:-translate-y-1 transition-all duration-200 relative"
            on:click={() => selectMode ? toggleJobSelection(job.id) : chooseJob(job)}
          >
            {#if selectMode}
              <div class="absolute top-4 right-4 z-10">
                <input
                  type="checkbox"
                  checked={$selectedJobIds.has(job.id)}
                  class="w-5 h-5 text-blue-600 rounded"
                  on:click|stopPropagation={() => toggleJobSelection(job.id)}
                />
              </div>
            {/if}

            <JobCard {job} />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>


