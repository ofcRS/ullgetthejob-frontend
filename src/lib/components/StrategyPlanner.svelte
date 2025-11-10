<script lang="ts">
  import { onMount } from 'svelte'
  import {
    currentStrategy,
    isGeneratingStrategy,
    sortedJobs,
    immediateJobs,
    highPriorityJobs,
    setStrategy,
    clearStrategy
  } from '$lib/stores/strategy.store'
  import { jobs } from '$lib/stores/jobs.store'
  import { uploadedCv } from '$lib/stores/cv.store'
  import { generateApplicationStrategy } from '$lib/api/strategy.api'
  import { showError, showSuccess } from '$lib/stores/feedback.store'
  import MatchScoreBadge from './MatchScoreBadge.svelte'
  import type { JobPriority } from '$lib/types'

  let generating = false
  let selectedJobs: string[] = []

  async function handleGenerate() {
    if (!$uploadedCv) {
      showError('No CV', 'Please upload a CV first')
      return
    }

    if ($jobs.length === 0) {
      showError('No Jobs', 'Please search for jobs first')
      return
    }

    generating = true
    $isGeneratingStrategy = true

    try {
      const jobsToAnalyze = selectedJobs.length > 0
        ? $jobs.filter(j => selectedJobs.includes(j.id))
        : $jobs

      const strategy = await generateApplicationStrategy(jobsToAnalyze, $uploadedCv)
      setStrategy(strategy)
      showSuccess('Strategy Generated', `Analyzed ${strategy.recommendedOrder.length} jobs`)
    } catch (error) {
      showError('Strategy Error', error instanceof Error ? error.message : 'Failed to generate strategy')
    } finally {
      generating = false
      $isGeneratingStrategy = false
    }
  }

  function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      immediate: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  function getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      immediate: '🔥',
      high: '⭐',
      medium: '📌',
      low: '📋'
    }
    return icons[priority] || '📋'
  }

  function formatTime(timeString: string | undefined): string {
    if (!timeString) return 'Apply anytime'
    return timeString
  }

  onMount(() => {
    if ($jobs.length > 0 && $uploadedCv && !$currentStrategy) {
      // Auto-generate on mount if we have data
      handleGenerate()
    }
  })
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Application Strategy</h1>
      <p class="text-gray-600 mt-1">AI-powered job application planning</p>
    </div>
    <div class="flex gap-2">
      {#if $currentStrategy}
        <button
          on:click={clearStrategy}
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
      {/if}
      <button
        on:click={handleGenerate}
        disabled={generating || !$uploadedCv || $jobs.length === 0}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {#if generating}
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        {/if}
        {generating ? 'Generating...' : 'Generate Strategy'}
      </button>
    </div>
  </div>

  {#if !$uploadedCv}
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p class="text-yellow-800">Please upload a CV to generate an application strategy</p>
    </div>
  {:else if $jobs.length === 0}
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p class="text-yellow-800">Please search for jobs to generate an application strategy</p>
    </div>
  {:else if $currentStrategy}
    <!-- Strategy Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Total Jobs Analyzed</div>
        <div class="text-3xl font-bold text-gray-900">{$currentStrategy.recommendedOrder.length}</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Estimated Success Rate</div>
        <div class="text-3xl font-bold text-green-600">{$currentStrategy.estimatedSuccess}%</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Immediate Priority</div>
        <div class="text-3xl font-bold text-red-600">{$immediateJobs.length}</div>
      </div>
    </div>

    <!-- Timing Recommendations -->
    {#if $currentStrategy.timing}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Optimal Timing</h2>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-1">Best Day</div>
            <div class="text-lg font-semibold text-gray-900">{$currentStrategy.timing.bestDayOfWeek}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Best Time</div>
            <div class="text-lg font-semibold text-gray-900">{$currentStrategy.timing.bestTimeOfDay}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Recommended Pace</div>
            <div class="text-lg font-semibold text-gray-900">{$currentStrategy.timing.recommendedPace}</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Prioritized Jobs -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Recommended Application Order</h2>
        <p class="text-sm text-gray-600 mt-1">Apply in this order for best results</p>
      </div>
      <div class="divide-y">
        {#each $sortedJobs as jobPriority, index}
          <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-4">
              <!-- Priority Number -->
              <div class="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              <!-- Job Details -->
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">{jobPriority.job.title}</h3>
                    <p class="text-gray-600">{jobPriority.job.company}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-3 py-1 text-sm rounded-full border-2 font-semibold {getPriorityColor(
                        jobPriority.priority
                      )}"
                    >
                      {getPriorityIcon(jobPriority.priority)}
                      {jobPriority.priority.toUpperCase()}
                    </span>
                    <MatchScoreBadge score={jobPriority.matchScore} size="md" />
                  </div>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {#if jobPriority.job.salary}
                    <span>💰 {jobPriority.job.salary}</span>
                  {/if}
                  {#if jobPriority.job.area}
                    <span>📍 {jobPriority.job.area}</span>
                  {/if}
                  <span>⭐ Score: {jobPriority.score.toFixed(1)}</span>
                </div>

                <!-- Reasons -->
                <div class="space-y-1 mb-3">
                  {#each jobPriority.reasons as reason}
                    <div class="flex items-start gap-2 text-sm text-gray-700">
                      <svg
                        class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{reason}</span>
                    </div>
                  {/each}
                </div>

                {#if jobPriority.bestApplyTime}
                  <div class="text-sm text-blue-600">
                    ⏰ Best time to apply: {formatTime(jobPriority.bestApplyTime)}
                  </div>
                {/if}

                <div class="flex gap-2 mt-3">
                  <a
                    href="/jobs?selected={jobPriority.job.id}"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    View & Customize
                  </a>
                  {#if jobPriority.job.url}
                    <a
                      href={jobPriority.job.url}
                      target="_blank"
                      rel="noreferrer"
                      class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                    >
                      View Original
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Optimization Tips -->
    {#if $currentStrategy.optimization}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Optimization Tips</h2>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {#if $currentStrategy.optimization.cvImprovements.length > 0}
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">CV Improvements</h3>
              <ul class="space-y-1">
                {#each $currentStrategy.optimization.cvImprovements as tip}
                  <li class="text-sm text-gray-700 flex items-start gap-2">
                    <span class="text-blue-600">•</span>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if $currentStrategy.optimization.skillsToHighlight.length > 0}
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Skills to Highlight</h3>
              <div class="flex flex-wrap gap-2">
                {#each $currentStrategy.optimization.skillsToHighlight as skill}
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{skill}</span>
                {/each}
              </div>
            </div>
          {/if}

          {#if $currentStrategy.optimization.coverLetterTips.length > 0}
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">Cover Letter Tips</h3>
              <ul class="space-y-1">
                {#each $currentStrategy.optimization.coverLetterTips as tip}
                  <li class="text-sm text-gray-700 flex items-start gap-2">
                    <span class="text-green-600">•</span>
                    <span>{tip}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if $currentStrategy.optimization.generalAdvice.length > 0}
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">General Advice</h3>
              <ul class="space-y-1">
                {#each $currentStrategy.optimization.generalAdvice as advice}
                  <li class="text-sm text-gray-700 flex items-start gap-2">
                    <span class="text-purple-600">•</span>
                    <span>{advice}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <div class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      </div>
      <p class="text-gray-600 mb-4">No strategy generated yet</p>
      <p class="text-sm text-gray-500">
        Click "Generate Strategy" to get AI-powered application recommendations
      </p>
    </div>
  {/if}
</div>
