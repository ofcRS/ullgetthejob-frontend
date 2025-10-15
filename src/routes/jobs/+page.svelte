<script lang="ts">
  import { selectedJob } from '$lib/stores/jobs.store'
  import { uploadedCv, customizedCv, coverLetter, selectedModel } from '$lib/stores/cv.store'
  import { customizeCv } from '$lib/api/cv.api'
  import CoverLetterEditor from '$lib/components/CoverLetterEditor.svelte'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import CVDiff from '$lib/components/CVDiff.svelte'
  import CVDisplayWithDiff from '$lib/components/CVDisplayWithDiff.svelte'

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
  <h1 class="text-3xl font-bold mb-2">Customize Your Application</h1>
  <p class="text-gray-600 mb-4">Review the AI-generated customizations and cover letter below</p>
  {#if !$uploadedCv}
    <p class="text-gray-600">You need to upload a CV first. <a href="/upload" class="text-blue-600">Go to upload</a>.</p>
  {/if}
  {#if !$uploadedCv}
    <p class="text-gray-600">No CV uploaded yet. <a href="/upload" class="text-blue-600">Upload now</a>.</p>
  {:else if !$selectedJob}
    <p class="text-gray-600">No job selected. <a href="/search" class="text-blue-600">Search jobs</a>.</p>
  {:else}
    <div class="grid lg:grid-cols-12 gap-6 mb-8">
      <div class="lg:col-span-4">
        <div class="column-card bg-gray-50">
          <div class="sticky top-0 bg-gray-50 pb-3 border-b border-gray-200 mb-4 z-10">
            <h3 class="font-semibold text-lg">Your Original CV</h3>
            <p class="text-sm text-gray-600">Uploaded version</p>
          </div>
          <CVDisplay cv={$uploadedCv} />
        </div>
      </div>
      <div class="lg:col-span-4">
        <div class="column-card bg-blue-50">
          <div class="sticky top-0 bg-blue-50 pb-3 border-b border-blue-200 mb-4 z-10">
            <h3 class="font-semibold text-lg">{ $selectedJob.title }</h3>
            <p class="text-sm text-gray-700">{ $selectedJob.company }</p>
          </div>
          <div class="space-y-6">
            {#if jobSkills.length}
              <div class="p-4 bg-white rounded-xl border border-blue-200">
                <h4 class="font-semibold text-sm text-gray-900 mb-3">Required Skills</h4>
                <div class="flex flex-wrap gap-2">
                  {#each jobSkills as s}
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{s}</span>
                  {/each}
                </div>
              </div>
            {/if}
            <div>
              <h4 class="font-semibold mb-2 text-sm text-gray-700">Description</h4>
              <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ $selectedJob.description }</p>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-4">
        <div class="column-card { $customizedCv ? 'bg-emerald-50' : 'bg-gray-100' }">
          <div class="sticky top-0 pb-3 border-b mb-4 z-10 { $customizedCv ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-100 border-gray-200' }">
            <h3 class="font-semibold text-lg">Customized CV</h3>
            {#if matchCalc}
              <div class="flex items-center gap-2 mt-2">
                <div class="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-500" style={`width: ${matchCalc.percent}%`} />
                </div>
                <span class="text-sm font-semibold text-emerald-700">{matchCalc.percent}% match</span>
              </div>
            {/if}
          </div>
          {#if $customizedCv}
            <CVDisplayWithDiff original={$uploadedCv} customized={$customizedCv} />
            <div class="mt-6 p-4 bg-white rounded-xl border border-emerald-200">
              <h4 class="font-semibold text-sm mb-3">Changes Made</h4>
              <CVDiff original={$uploadedCv} customized={$customizedCv} />
            </div>
          {:else}
            <div class="text-center py-12">
              <p class="text-gray-500">Click Generate to customize</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if $coverLetter}
      <div class="card bg-white mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-lg">Cover Letter</h3>
          <button class="text-sm text-blue-600 hover:text-blue-700" on:click={generate}>Regenerate</button>
        </div>
        <CoverLetterEditor bind:value={$coverLetter} />
      </div>
    {/if}

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-50">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm">
          {#if $customizedCv}
            <span class="text-emerald-600">Ready to apply</span>
          {/if}
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-secondary">Save Draft</button>
          <button class="btn btn-primary" disabled={isGenerating} on:click={generate}>
            {isGenerating ? 'Generating...' : ($customizedCv ? 'Regenerate' : 'Generate Customization')}
          </button>
          {#if $customizedCv && $coverLetter}
            <button class="btn text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30">Continue to Apply →</button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>


