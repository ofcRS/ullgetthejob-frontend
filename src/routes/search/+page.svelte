<script lang="ts">
  import { jobs, isSearching, selectedJob } from '$lib/stores/jobs.store'
  import JobCard from '$lib/components/JobCard.svelte'
  import { searchJobs } from '$lib/api/jobs.api'

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
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-4">Search Jobs</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <input class="input" type="text" bind:value={query} placeholder="e.g. JavaScript Developer" on:keydown={(e) => e.key==='Enter' && runSearch()} />
    <select class="input" bind:value={area}>
      <option value="1">Moscow</option>
      <option value="2">Saint Petersburg</option>
      <option value="113">Russia</option>
    </select>
    <button class="btn btn-primary" disabled={$isSearching || !query.trim()} on:click={runSearch}>
      {$isSearching ? 'Searching...' : 'Search'}
    </button>
  </div>

  {#if error}
    <p class="text-sm text-red-600 mt-3">{error}</p>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
    {#each $jobs as job}
      <button on:click={() => selectedJob.set(job)}>
        <JobCard {job} />
      </button>
    {/each}
  </div>
</div>


