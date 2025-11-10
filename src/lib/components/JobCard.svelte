<script lang="ts">
  import type { JobItem, MatchScore } from '$lib/types'
  import MatchScoreBadge from './MatchScoreBadge.svelte'

  export let job: JobItem
  export let matchScore: MatchScore | undefined = undefined
  export let showMatchDetails = false
</script>

<div class="card text-left bg-white hover:shadow-lg transition-all">
  <div class="flex items-start justify-between gap-2 mb-2">
    <h3 class="font-semibold text-lg text-gray-900 flex-1">
      {job.title}
      {#if job.has_test}
        <span class="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Test Required</span>
      {/if}
    </h3>
    {#if matchScore}
      <div class="flex-shrink-0">
        <MatchScoreBadge score={matchScore} size="md" showDetails={showMatchDetails} />
      </div>
    {/if}
  </div>
  <p class="text-gray-700 mb-2">{job.company}</p>
  <div class="flex flex-wrap gap-2 text-sm text-gray-600">
    {#if job.salary}
      <span>💰 {job.salary}</span>
    {/if}
    {#if job.area}
      <span>📍 {job.area}</span>
    {/if}
  </div>
  {#if job.skills && job.skills.length > 0}
    <div class="flex flex-wrap gap-2 mt-3">
      {#each job.skills.slice(0, 5) as skill}
        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{skill}</span>
      {/each}
    </div>
  {/if}
  {#if job.url}
    <a class="text-blue-600 text-sm mt-2 inline-block" href={job.url} target="_blank" rel="noreferrer">View posting</a>
  {/if}
  </div>


