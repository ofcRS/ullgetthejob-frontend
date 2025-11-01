<script lang="ts">
  import { jobs, selectedJob } from '$lib/stores/jobs.store'
  import { uploadedCv, customizedCv, coverLetter, selectedModel } from '$lib/stores/cv.store'
  import { customizeCv } from '$lib/api/cv.api'
  import { getJobDetails } from '$lib/api/jobs.api'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import CoverLetterEditor from '$lib/components/CoverLetterEditor.svelte'
  import type { JobItem } from '$lib/types'

  let isGenerating = false
  let error = ''
  let success = ''
  let jobDetailError = ''
  let jobDetailLoading = false
  let detailFetchInFlightFor: string | null = null

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
    } else {
      error = res.error || 'Generation failed'
    }
    isGenerating = false
  }

  $: if ($selectedJob) {
    void ensureJobDetail($selectedJob)
  }

  function shouldFetchFullDescription(job: JobItem | null) {
    if (!job) return false
    if (job.fullDescriptionLoaded) return false
    const length = job.description ? job.description.trim().length : 0
    return length < 400
  }

  async function ensureJobDetail(job: JobItem) {
    if (!shouldFetchFullDescription(job)) {
      jobDetailError = ''
      return
    }

    if (detailFetchInFlightFor === job.id) return
    detailFetchInFlightFor = job.id
    jobDetailLoading = true
    jobDetailError = ''

    try {
      const result = await getJobDetails(job.id)

      if (result.success && result.job) {
        const updatedJob = {
          ...job,
          ...result.job,
          fullDescriptionLoaded: true
        }

        if ($selectedJob?.id === job.id) {
          selectedJob.set(updatedJob)
        }

        jobs.update((items) =>
          items.map((item) => (item.id === job.id ? { ...item, ...result.job, fullDescriptionLoaded: true } : item))
        )
      } else if (!result.success) {
        jobDetailError = result.error || 'Failed to load job details'
      }
    } catch (err) {
      jobDetailError = err instanceof Error ? err.message : 'Failed to load job details'
    } finally {
      if (detailFetchInFlightFor === job.id) {
        detailFetchInFlightFor = null
      }
      jobDetailLoading = false
    }
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <h1 class="text-3xl font-bold mb-4">Job Details</h1>
  {#if !$selectedJob}
    <p class="text-gray-600">No job selected. <a href="/search" class="text-blue-600">Search jobs</a>.</p>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card bg-white">
        <h3 class="font-semibold mb-3 border-b pb-2">{ $selectedJob.title }</h3>
        {#if jobDetailLoading}
          <p class="text-xs text-blue-600 mb-2">Loading full description…</p>
        {:else if jobDetailError}
          <p class="text-xs text-red-600 mb-2">{jobDetailError}</p>
        {/if}
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{ $selectedJob.description }</p>
      </div>
      <div class="card bg-white">
        <h3 class="font-semibold mb-3 border-b pb-2">Your CV</h3>
        {#if $uploadedCv}
          <CVDisplay cv={$uploadedCv} />
        {:else}
          <p class="text-gray-600">No CV uploaded. <a class="text-blue-600" href="/upload">Upload</a>.</p>
        {/if}
      </div>
    </div>

    {#if $customizedCv}
      <div class="card bg-white mb-6">
        <h3 class="font-semibold mb-3 border-b pb-2">Customized CV</h3>
        <CVDisplay cv={$customizedCv} />
      </div>
    {/if}

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


