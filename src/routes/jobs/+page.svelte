<script lang="ts">
  import { jobs, selectedJob } from '$lib/stores/jobs.store'
  import { uploadedCv, customizedCv, coverLetter, selectedModel } from '$lib/stores/cv.store'
  import { customizeCv } from '$lib/api/cv.api'
  import { getJobDetails } from '$lib/api/jobs.api'
  import CoverLetterEditor from '$lib/components/CoverLetterEditor.svelte'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import DiffModal from '$lib/components/DiffModal.svelte'
  import { normalizeJob } from '$lib/utils/job'
  import { get } from 'svelte/store'
  import type { ParsedCV, CustomizedCV, JobItem } from '$lib/types'

  let isGenerating = false
  let error = ''
  let success = ''
  let jobSkills: any = null
  let showDiffModal = false
  let customizedForJobId: string | null = null
  let jobDetailError = ''
  let jobDetailLoadingFor: string | null = null
  let jobDetailLoading = false
  const detailFetchPromises = new Map<string, Promise<JobItem>>()
  let selectedJobDescription = ''
  let lastSelectedJobId: string | null = null

  // Typed non-null views guarded by UI conditions
  $: jobDetailLoading = jobDetailLoadingFor !== null && $selectedJob?.id === jobDetailLoadingFor
  $: selectedJobDescription = $selectedJob?.fullDescription ?? $selectedJob?.description ?? ''
  $: uploadedCvNN = $uploadedCv as ParsedCV
  $: customizedCvNN = $customizedCv as CustomizedCV

  // Extract all skills from structured response or handle flat array
  $: allJobSkills = (() => {
    if (jobSkills) {
      if (Array.isArray(jobSkills)) return jobSkills
      const skills: string[] = []
      if (jobSkills.required) skills.push(...jobSkills.required)
      if (jobSkills.preferred) skills.push(...jobSkills.preferred)
      if (jobSkills.tools) skills.push(...jobSkills.tools)
      if (jobSkills.frameworks) skills.push(...jobSkills.frameworks)
      return [...new Set(skills)]
    }

    const fallbackSkills = $selectedJob?.skills
    return fallbackSkills && fallbackSkills.length ? fallbackSkills : []
  })()

  $: isCurrentJobCustomization = $customizedCv && $selectedJob && customizedForJobId === $selectedJob.id

  $: matchCalc = (() => {
    if (isCurrentJobCustomization && allJobSkills.length && $customizedCv?.skills?.length) {
      const jobSet = new Set(allJobSkills.map((s) => s.toLowerCase()))
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
    let jobForGeneration = $selectedJob

    try {
      jobForGeneration = await ensureJobDetail($selectedJob)
    } catch (err) {
      console.error('Failed to ensure full job description', err)
    }

    const jobDescription = jobForGeneration.fullDescription ?? jobForGeneration.description

    if (!jobDescription || !jobDescription.trim().length) {
      error = 'Job description unavailable. Please reload the job posting and try again.'
      isGenerating = false
      return
    }

    const res = await customizeCv({ cv: $uploadedCv, jobDescription, model: $selectedModel })
    if (res.success) {
      customizedCv.set(res.customizedCV!)
      coverLetter.set(res.coverLetter || '')
      success = `Generated with ${res.modelUsed}!`
      jobSkills = res.jobSkills || null
      customizedForJobId = jobForGeneration.id
    } else {
      error = res.error || 'Generation failed'
    }
    isGenerating = false
  }

  $: if ($selectedJob && customizedForJobId && customizedForJobId !== $selectedJob.id) {
    customizedCv.set(null)
    coverLetter.set('')
    jobSkills = null
    customizedForJobId = null
  }

  $: if ($selectedJob) {
    if (lastSelectedJobId !== $selectedJob.id) {
      jobDetailError = ''
      lastSelectedJobId = $selectedJob.id
    }
    void ensureJobDetail($selectedJob)
  } else {
    lastSelectedJobId = null
    jobDetailLoadingFor = null
  }

  function shouldFetchFullDescription(job: JobItem | null) {
    if (!job) return false
    if (job.fullDescriptionLoaded && job.fullDescription && job.fullDescription.trim().length > 0) return false
    return true
  }

  async function ensureJobDetail(job: JobItem, options: { force?: boolean } = {}): Promise<JobItem> {
    if (!options.force && !shouldFetchFullDescription(job)) {
      jobDetailError = ''
      return job
    }

    const existingPromise = detailFetchPromises.get(job.id)
    if (existingPromise) {
      jobDetailLoadingFor = job.id
      return existingPromise
    }

    const fetchPromise = (async () => {
      jobDetailLoadingFor = job.id
      jobDetailError = ''

      try {
        const result = await getJobDetails(job.id)

        if (result.success && result.job) {
          const normalized = normalizeJob(result.job, {
            ...job,
            descriptionPreview: job.descriptionPreview ?? job.description
          })

          normalized.fullDescriptionLoaded = true
          normalized.descriptionPreview = job.descriptionPreview ?? normalized.descriptionPreview ?? job.description
          normalized.description = normalized.fullDescription ?? normalized.description

          const currentSelected = get(selectedJob)
          if (currentSelected?.id === job.id) {
            selectedJob.set(normalized)
          }

          jobs.update((items) =>
            items.map((item) => (item.id === job.id ? normalized : item))
          )

          return normalized
        }

        jobDetailError = result.error || 'Failed to load job details'
        return job
      } catch (err) {
        jobDetailError = err instanceof Error ? err.message : 'Failed to load job details'
        return job
      } finally {
        detailFetchPromises.delete(job.id)
        if (jobDetailLoadingFor === job.id) {
          jobDetailLoadingFor = null
        }
      }
    })()

    detailFetchPromises.set(job.id, fetchPromise)
    return fetchPromise
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-2">Customize Your Application</h1>
  <p class="text-gray-600 mb-4">Review the AI-generated customizations and cover letter below</p>
  
  {#if !$uploadedCv}
    <p class="text-gray-600">No CV uploaded yet. <a href="/upload" class="text-blue-600 hover:underline">Upload now</a>.</p>
  {:else if !$selectedJob}
    <p class="text-gray-600">No job selected. <a href="/search" class="text-blue-600 hover:underline">Search jobs</a>.</p>
  {:else}
    <!-- Three Column Layout -->
    <div class="grid lg:grid-cols-12 gap-6 mb-8">
      <!-- Column 1: Original CV -->
      <div class="lg:col-span-4">
        <div class="column-card bg-gray-50">
          <div class="sticky top-0 bg-gray-50 pb-3 border-b border-gray-200 mb-4 z-10">
            <h3 class="font-semibold text-lg">Your Original CV</h3>
            <p class="text-sm text-gray-600">Uploaded version</p>
          </div>
          <CVDisplay cv={uploadedCvNN} />
        </div>
      </div>

      <!-- Column 2: Job Description (with skills) -->
      <div class="lg:col-span-4">
        <div class="column-card bg-blue-50">
          <div class="sticky top-0 bg-blue-50 pb-3 border-b border-blue-200 mb-4 z-10">
            <h3 class="font-semibold text-lg text-gray-900">{$selectedJob.title}</h3>
            <p class="text-sm text-gray-700 font-medium">{$selectedJob.company}</p>
            <div class="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
              {#if $selectedJob.salary}
                <span class="px-2 py-1 bg-white rounded-md">💰 {$selectedJob.salary}</span>
              {/if}
              {#if $selectedJob.area}
                <span class="px-2 py-1 bg-white rounded-md">📍 {$selectedJob.area}</span>
              {/if}
              {#if $selectedJob.has_test}
                <span class="px-2 py-1 bg-amber-100 text-amber-800 rounded-md font-medium">⚠️ Test Required</span>
              {/if}
            </div>
          </div>
          
          <div class="space-y-6">
            {#if allJobSkills.length}
              <section>
                <h4 class="font-semibold text-sm mb-2 text-gray-900">Required Skills</h4>
                <div class="flex flex-wrap gap-2">
                  {#each allJobSkills as skill}
                    {@const isMatched = $customizedCv?.skills?.some(s => s.toLowerCase() === skill.toLowerCase())}
                    <span class="px-2 py-1 rounded text-xs font-medium {isMatched ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' : 'bg-red-100 text-red-800'}">{skill}</span>
                  {/each}
                </div>
              </section>
            {/if}

            <section>
              <h4 class="font-semibold text-sm mb-2 text-gray-900">Job Description</h4>
              {#if jobDetailLoading}
                <div class="flex items-center gap-2 text-xs text-blue-600 mb-2">
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Loading full description…</span>
                </div>
              {:else if jobDetailError}
                <p class="text-xs text-red-600 mb-2">{jobDetailError}</p>
              {/if}
              <div class="prose prose-sm max-w-none">
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap description-scroll">{selectedJobDescription}</div>
              </div>
            </section>

            <!-- External Link -->
            {#if $selectedJob.url}
              <a 
                href={$selectedJob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="block w-full text-center px-4 py-2 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                View Original Posting ↗
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Column 3: Customized CV (job-aware) -->
      <div class="lg:col-span-4">
        <div class="column-card {isCurrentJobCustomization ? 'bg-emerald-50' : 'bg-gray-100'}">
          <div class="sticky top-0 pb-3 border-b mb-4 z-10 {isCurrentJobCustomization ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-100 border-gray-200'}">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-lg">Customized CV</h3>
              {#if isCurrentJobCustomization}
                <button 
                  on:click={() => showDiffModal = true}
                  class="text-sm px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-md font-medium transition-colors flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Show Changes
                </button>
              {/if}
            </div>
            {#if matchCalc}
              <div class="flex items-center gap-2 mt-2">
                <div class="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-500" style="width: {matchCalc.percent}%" />
                </div>
                <span class="text-sm font-semibold text-emerald-700">{matchCalc.percent}% match</span>
              </div>
            {/if}
          </div>
          {#if isCurrentJobCustomization}
            <CVDisplay cv={customizedCvNN} />
          {:else if $customizedCv}
            <div class="text-center py-12">
              <div class="mb-4 text-4xl">🔄</div>
              <p class="text-gray-700 font-medium mb-2">CV from different job</p>
              <p class="text-sm text-gray-500 mb-4">This customization is for a different job position.</p>
              <button 
                on:click={generate}
                class="btn btn-primary"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate for This Job'}
              </button>
            </div>
          {:else}
            <div class="text-center py-12">
              <div class="mb-4 text-4xl">✨</div>
              <p class="text-gray-500 mb-4">Click Generate to customize your CV for this job</p>
              <button 
                on:click={generate}
                class="btn btn-primary"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Customized CV'}
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Cover Letter Section -->
    {#if isCurrentJobCustomization && $coverLetter}
      <div class="card bg-white mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg">Cover Letter</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700" on:click={generate}>Regenerate</button>
        </div>
        <CoverLetterEditor bind:value={$coverLetter} />
      </div>
    {/if}

    <!-- Action Bar (Fixed at Bottom) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-50">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm">
          {#if error}
            <span class="text-red-600">❌ {error}</span>
          {:else if success}
            <span class="text-emerald-600">✓ {success}</span>
          {:else if isCurrentJobCustomization}
            <span class="text-emerald-600">✓ Ready to apply</span>
          {:else if $customizedCv}
            <span class="text-amber-600">⚠️ CV is for a different job</span>
          {/if}
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-secondary">Save Draft</button>
          <button class="btn btn-primary" disabled={isGenerating || !$uploadedCv || !$selectedJob} on:click={generate}>
            {isGenerating ? 'Generating...' : (isCurrentJobCustomization ? 'Regenerate' : 'Generate')}
          </button>
          {#if isCurrentJobCustomization && $coverLetter}
            <button class="btn text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30">
              Continue to Apply →
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if isCurrentJobCustomization && $uploadedCv}
  <DiffModal 
    original={uploadedCvNN} 
    customized={customizedCvNN}
    isOpen={showDiffModal}
    on:close={() => showDiffModal = false}
  />
{/if}

<style>
  /* Ensure smooth scrolling for sticky columns */
  .column-card {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar styling */
  .column-card::-webkit-scrollbar {
    width: 6px;
  }

  .column-card::-webkit-scrollbar-track {
    background: transparent;
  }

  .column-card::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 3px;
  }

  .column-card::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }

  .description-scroll {
    max-height: 22rem;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .description-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .description-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .description-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 3px;
  }

  .description-scroll::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
</style>