<script lang="ts">
  import { selectedJob } from '$lib/stores/jobs.store'
  import { uploadedCv, customizedCv, coverLetter, selectedModel } from '$lib/stores/cv.store'
  import { customizeCv } from '$lib/api/cv.api'
  import CoverLetterEditor from '$lib/components/CoverLetterEditor.svelte'
  import CVDisplay from '$lib/components/CVDisplay.svelte'

  let isGenerating = false
  let error = ''
  let success = ''
  let jobSkills: string[] = []

  $: matchCalc = (() => {
    if (jobSkills.length && $customizedCv?.skills?.length) {
      const jobSet = new Set(jobSkills.map((s) => s.toLowerCase()))
      const cvSet = new Set(($customizedCv.skills || []).map((s) => s.toLowerCase()))
      const match = [...jobSet].filter((s) => cvSet.has(s))
      const percent = Math.round((match.length / jobSet.size) * 100)
      return { match, percent }
    }
    return null
  })()

  async function generate() {
    if (!$uploadedCv || !$selectedJob) return
    isGenerating = true
    error = ''
    success = ''
    const res = await customizeCv({ cv: $uploadedCv, jobDescription: $selectedJob.description, model: $selectedModel })
    if (res.success) {
      customizedCv.set(res.customizedCV!)
      coverLetter.set(res.coverLetter || '')
      success = `Generated with ${res.modelUsed}!`
      jobSkills = res.jobSkills || []
    } else {
      error = res.error || 'Generation failed'
    }
    isGenerating = false
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-4">Customize</h1>

  {#if !$uploadedCv}
    <p class="text-gray-600">No CV uploaded yet. <a href="/upload" class="text-blue-600">Upload now</a>.</p>
  {:else if !$selectedJob}
    <p class="text-gray-600">No job selected. <a href="/search" class="text-blue-600">Search jobs</a>.</p>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="card bg-white">
        <h3 class="font-semibold mb-3 border-b pb-2">Your CV</h3>
        <CVDisplay cv={$uploadedCv} />
      </div>
      <div class="card bg-blue-50">
        <h3 class="font-semibold mb-3 border-b border-blue-200 pb-2">{ $selectedJob.title }</h3>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{ $selectedJob.description }</p>
        {#if jobSkills.length}
          <div class="mt-3">
            <p class="text-sm font-medium text-gray-700 mb-2">Extracted required skills</p>
            <div class="flex flex-wrap gap-2">
              {#each jobSkills as s}
                <span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">{s}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      <div class="card { $customizedCv ? 'bg-green-50' : 'bg-gray-50' }">
        <h3 class="font-semibold mb-3 border-b pb-2">Customized CV</h3>
        {#if $customizedCv}
          <CVDisplay cv={$customizedCv} />
          {#if matchCalc}
            <div class="mt-3">
              <p class="text-sm text-gray-700">Skill match: <span class="font-semibold">{matchCalc.percent}%</span></p>
              {#if matchCalc.match.length}
                <div class="flex flex-wrap gap-2 mt-1">
                  {#each matchCalc.match as s}
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{s}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        {:else}
          <p class="text-gray-500">Not generated yet</p>
        {/if}
      </div>
    </div>

    {#if $coverLetter}
      <div class="card bg-white mb-6">
        <h3 class="font-semibold mb-3 border-b pb-2">Cover Letter</h3>
        <CoverLetterEditor bind:value={$coverLetter} />
      </div>
    {/if}

    <button class="btn btn-primary" disabled={isGenerating} on:click={generate}>
      {isGenerating ? 'Generating...' : 'Generate'}
    </button>
    {#if error}<p class="text-sm text-red-600 mt-2">{error}</p>{/if}
    {#if success}<p class="text-sm text-green-600 mt-2">{success}</p>{/if}
  {/if}
</div>


