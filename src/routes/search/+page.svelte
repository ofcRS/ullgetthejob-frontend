<script lang="ts">
  import { jobs, isSearching, selectedJob } from '$lib/stores/jobs.store'
  import JobCard from '$lib/components/JobCard.svelte'
  import { searchJobs } from '$lib/api/jobs.api'
  import { uploadedCv } from '$lib/stores/cv.store'
  import { goto } from '$app/navigation'

  let query = ''
  let area = '1'
  let error = ''

  async function runSearch() {
    if (!query.trim()) return
    isSearching.set(true)
    error = ''
    jobs.set([])
    const res = await searchJobs({ text: query, area, schedule: 'remote' })
    if (res.success) {
      jobs.set(res.jobs)
    } else {
      error = res.error || 'Search failed'
    }
    isSearching.set(false)
  }

  $: selectedCvInfo = $uploadedCv ? {
    name: `${$uploadedCv.firstName || ''} ${$uploadedCv.lastName || ''}`.trim(),
    title: $uploadedCv.title,
    skillCount: $uploadedCv.skills?.length || 0
  } : null

  function chooseJob(job: any) {
    selectedJob.set(job)
    goto('/jobs')
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-4">Search Jobs</h1>

  {#if selectedCvInfo}
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
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="md:col-span-2">
        <label class="label" for="search-query">Job Title or Keywords</label>
        <div class="relative">
          <input id="search-query" type="text" bind:value={query} placeholder="e.g. Full Stack Developer, React Engineer" class="input" on:keydown={(e) => e.key==='Enter' && runSearch()} />
        </div>
      </div>
      <div>
        <label class="label" for="search-area">Location</label>
        <div class="relative">
          <select id="search-area" bind:value={area} class="input">
            <option value="1">Moscow</option>
            <option value="2">Saint Petersburg</option>
            <option value="113">All Russia</option>
          </select>
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
        <h3 class="text-xl font-semibold">{$jobs.length} jobs found</h3>
        <button class="text-sm text-blue-600 hover:text-blue-700">Sort by relevance ▾</button>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        {#each $jobs as job}
          <button class="text-left group transform hover:-translate-y-1 transition-all duration-200" on:click={() => chooseJob(job)}>
            <JobCard {job} />
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>


