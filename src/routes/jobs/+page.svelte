<script lang="ts">
  import { selectedJob } from '$lib/stores/jobs.store'
  import { uploadedCv, customizedCv, coverLetter, selectedModel } from '$lib/stores/cv.store'
  import { customizeCv } from '$lib/api/cv.api'
  import CoverLetterEditor from '$lib/components/CoverLetterEditor.svelte'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import DiffModal from '$lib/components/DiffModal.svelte'

  let isGenerating = false
  let error = ''
  let success = ''
  let jobSkills: any = null
  let showDiffModal = false

  // Extract all skills from structured response or handle flat array
  $: allJobSkills = (() => {
    if (!jobSkills) return []
    if (Array.isArray(jobSkills)) return jobSkills
    const skills: string[] = []
    if (jobSkills.required) skills.push(...jobSkills.required)
    if (jobSkills.preferred) skills.push(...jobSkills.preferred)
    if (jobSkills.tools) skills.push(...jobSkills.tools)
    if (jobSkills.frameworks) skills.push(...jobSkills.frameworks)
    return [...new Set(skills)]
  })()

  $: matchCalc = (() => {
    if (allJobSkills.length && $customizedCv?.skills?.length) {
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
    const res = await customizeCv({ cv: $uploadedCv, jobDescription: $selectedJob.description, model: $selectedModel })
    if (res.success) {
      customizedCv.set(res.customizedCV!)
      coverLetter.set(res.coverLetter || '')
      success = `Generated with ${res.modelUsed}!`
      jobSkills = res.jobSkills || null
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
          <CVDisplay cv={$uploadedCv} />
        </div>
      </div>

      <!-- Column 2: Job Description -->
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
            <!-- Structured Job Skills -->
            {#if jobSkills && (jobSkills.required?.length || jobSkills.preferred?.length || jobSkills.tools?.length || jobSkills.frameworks?.length)}
              <div class="space-y-4">
                {#if jobSkills.required?.length}
                  <div class="p-4 bg-white rounded-xl border-2 border-red-200">
                    <h4 class="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                      Required Skills
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {#each jobSkills.required as skill}
                        <span class="px-3 py-1.5 bg-red-50 text-red-800 border border-red-200 rounded-md text-xs font-medium">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if jobSkills.preferred?.length}
                  <div class="p-4 bg-white rounded-xl border border-blue-200">
                    <h4 class="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Preferred Skills
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {#each jobSkills.preferred as skill}
                        <span class="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-medium">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if jobSkills.tools?.length}
                  <div class="p-4 bg-white rounded-xl border border-gray-200">
                    <h4 class="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
                      Tools & Platforms
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {#each jobSkills.tools as skill}
                        <span class="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-xs font-medium">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if jobSkills.frameworks?.length}
                  <div class="p-4 bg-white rounded-xl border border-purple-200">
                    <h4 class="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Frameworks
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {#each jobSkills.frameworks as skill}
                        <span class="px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md text-xs font-medium">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {:else if allJobSkills.length > 0}
              <!-- Fallback for flat array -->
              <div class="p-4 bg-white rounded-xl border border-blue-200">
                <h4 class="font-semibold text-sm text-gray-900 mb-3">Required Skills</h4>
                <div class="flex flex-wrap gap-2">
                  {#each allJobSkills as skill}
                    <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">{skill}</span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Job Description -->
            <div class="bg-white rounded-xl p-4">
              <h4 class="font-semibold mb-3 text-sm text-gray-900">Job Description</h4>
              <div class="prose prose-sm max-w-none">
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {$selectedJob.description}
                </div>
              </div>
            </div>

            <!-- External Link -->
            {#if $selectedJob.url}
              <a 
                href={$selectedJob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="block w-full text-center px-4 py-2 bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                View on HH.ru ↗
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Column 3: Customized CV (Redesigned) -->
      <div class="lg:col-span-4">
        <div class="column-card {$customizedCv ? 'bg-emerald-50' : 'bg-gray-100'}">
          <div class="sticky top-0 pb-3 border-b mb-4 z-10 {$customizedCv ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-100 border-gray-200'}">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-lg">Customized CV</h3>
              {#if $customizedCv}
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
          {#if $customizedCv}
            <CVDisplay cv={$customizedCv} />
          {:else}
            <div class="text-center py-12">
              <p class="text-gray-500">Click Generate to customize</p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Cover Letter Section -->
    {#if $coverLetter}
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
          {:else if $customizedCv}
            <span class="text-emerald-600">✓ Ready to apply</span>
          {/if}
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-secondary">Save Draft</button>
          <button class="btn btn-primary" disabled={isGenerating} on:click={generate}>
            {isGenerating ? 'Generating...' : ($customizedCv ? 'Regenerate' : 'Generate Customization')}
          </button>
          {#if $customizedCv && $coverLetter}
            <button class="btn text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30">
              Continue to Apply →
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if $customizedCv && $uploadedCv}
  <DiffModal 
    original={$uploadedCv} 
    customized={$customizedCv}
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
</style>