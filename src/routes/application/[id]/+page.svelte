<script lang="ts">
  import { uploadedCv, customizedCv, coverLetter } from '$lib/stores/cv.store'
  import { selectedJob } from '$lib/stores/jobs.store'
  import { submitApplication } from '$lib/api/cv.api'

  let isSubmitting = false
  let error = ''
  let success = ''

  async function submit() {
    if (!$customizedCv || !$coverLetter || !$selectedJob) return
    isSubmitting = true
    error = ''
    const res = await submitApplication({
      jobExternalId: $selectedJob.hh_vacancy_id || $selectedJob.id,
      customizedCV: $customizedCv,
      coverLetter: $coverLetter
    })
    if (res.success) {
      success = 'Application submitted!'
    } else {
      error = res.error || 'Submission failed'
    }
    isSubmitting = false
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
  <h1 class="text-3xl font-bold mb-4">Submit Application</h1>

  {#if !$customizedCv || !$coverLetter}
    <p class="text-gray-600">Customize your CV first. <a href="/jobs" class="text-blue-600">Go back</a>.</p>
  {:else}
    <button class="btn btn-primary" disabled={isSubmitting} on:click={submit}>
      {isSubmitting ? 'Submitting...' : 'Submit to HH.ru'}
    </button>
    {#if error}<p class="text-sm text-red-600 mt-2">{error}</p>{/if}
    {#if success}<p class="text-sm text-green-600 mt-2">{success}</p>{/if}
  {/if}
</div>


