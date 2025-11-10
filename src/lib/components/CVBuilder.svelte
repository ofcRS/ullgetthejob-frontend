<script lang="ts">
  import { onMount } from 'svelte'
  import {
    cvBuilderState,
    sections,
    pendingSuggestions,
    appliedSuggestions,
    isAnalyzing,
    updateSection,
    applySuggestion,
    dismissSuggestion,
    exportCV,
    initializeCV,
    setAnalyzing
  } from '$lib/stores/cv-builder.store'
  import { analyzeCVSection } from '$lib/api/cv-builder.api'
  import { showError, showSuccess } from '$lib/stores/feedback.store'
  import { uploadedCv } from '$lib/stores/cv.store'
  import CVDisplay from './CVDisplay.svelte'

  let selectedSection: string | null = null
  let analyzing = false
  let showPreview = false

  const sectionLabels: Record<string, string> = {
    personal: 'Personal Information',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects'
  }

  async function handleAnalyze(sectionType: string) {
    const section = $sections.find(s => s.type === sectionType)
    if (!section || analyzing) return

    analyzing = true
    setAnalyzing(true)

    try {
      const cv = exportCV()
      const suggestions = await analyzeCVSection(section, cv)

      if (suggestions.length > 0) {
        const { addSuggestions } = await import('$lib/stores/cv-builder.store')
        addSuggestions(suggestions)
        showSuccess('Analysis Complete', `Found ${suggestions.length} suggestions`)
      } else {
        showSuccess('Analysis Complete', 'No suggestions found - looking good!')
      }
    } catch (error) {
      showError('Analysis Error', error instanceof Error ? error.message : 'Failed to analyze section')
    } finally {
      analyzing = false
      setAnalyzing(false)
    }
  }

  function handleApply(suggestionId: string) {
    applySuggestion(suggestionId)
    showSuccess('Applied', 'Suggestion applied successfully')
  }

  function handleDismiss(suggestionId: string) {
    dismissSuggestion(suggestionId)
  }

  function getSuggestionIcon(type: string): string {
    const icons: Record<string, string> = {
      improve: '✨',
      add: '➕',
      remove: '➖',
      rephrase: '🔄'
    }
    return icons[type] || '💡'
  }

  function getSuggestionColor(confidence: number): string {
    if (confidence >= 0.8) return 'border-green-500 bg-green-50'
    if (confidence >= 0.6) return 'border-blue-500 bg-blue-50'
    return 'border-yellow-500 bg-yellow-50'
  }

  onMount(() => {
    if ($uploadedCv) {
      initializeCV($uploadedCv)
    }
  })

  $: previewCV = exportCV()
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <!-- Editor -->
  <div class="lg:col-span-2 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">CV Builder</h2>
      <div class="flex gap-2">
        <button
          on:click={() => (showPreview = !showPreview)}
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>
    </div>

    {#each $sections as section}
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{sectionLabels[section.type]}</h3>
          <button
            on:click={() => handleAnalyze(section.type)}
            disabled={analyzing || $isAnalyzing}
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? 'Analyzing...' : 'Get AI Suggestions'}
          </button>
        </div>
        <div class="p-4">
          <textarea
            value={section.content}
            on:input={e => updateSection(section.type, e.currentTarget.value)}
            rows={section.type === 'personal' ? 3 : section.type === 'skills' ? 2 : 6}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder={`Enter your ${sectionLabels[section.type].toLowerCase()}...`}
          />
        </div>
      </div>
    {/each}
  </div>

  <!-- Suggestions Sidebar -->
  <div class="space-y-6">
    <!-- Pending Suggestions -->
    {#if $pendingSuggestions.length > 0}
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">AI Suggestions</h3>
          <p class="text-sm text-gray-600 mt-1">{$pendingSuggestions.length} suggestions</p>
        </div>
        <div class="divide-y max-h-[600px] overflow-y-auto">
          {#each $pendingSuggestions as suggestion}
            <div class="p-4 {getSuggestionColor(suggestion.confidence)} border-l-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{getSuggestionIcon(suggestion.type)}</span>
                  <span class="text-sm font-medium text-gray-900 capitalize"
                    >{suggestion.type}</span
                  >
                </div>
                <span class="text-xs text-gray-600">{Math.round(suggestion.confidence * 100)}%</span
                >
              </div>

              <div class="text-sm space-y-2">
                <div>
                  <span class="font-medium text-gray-700">Section:</span>
                  <span class="text-gray-900">{sectionLabels[suggestion.section]}</span>
                </div>

                {#if suggestion.originalText}
                  <div>
                    <span class="font-medium text-gray-700">Current:</span>
                    <p class="text-gray-600 italic mt-1">{suggestion.originalText}</p>
                  </div>
                {/if}

                <div>
                  <span class="font-medium text-gray-700">Suggested:</span>
                  <p class="text-gray-900 mt-1">{suggestion.suggestedText}</p>
                </div>

                <div>
                  <span class="font-medium text-gray-700">Reason:</span>
                  <p class="text-gray-600 mt-1">{suggestion.reason}</p>
                </div>
              </div>

              <div class="flex gap-2 mt-3">
                <button
                  on:click={() => handleApply(suggestion.id)}
                  class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  on:click={() => handleDismiss(suggestion.id)}
                  class="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <p class="text-gray-600">No suggestions yet</p>
        <p class="text-sm text-gray-500 mt-1">Click "Get AI Suggestions" to analyze a section</p>
      </div>
    {/if}

    <!-- Applied Suggestions Count -->
    {#if $appliedSuggestions.length > 0}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2 text-green-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="font-medium">{$appliedSuggestions.length} suggestions applied</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Preview Modal -->
{#if showPreview}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    on:click={() => (showPreview = false)}
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
      on:click|stopPropagation
    >
      <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-900">CV Preview</h3>
        <button
          on:click={() => (showPreview = false)}
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-6">
        <CVDisplay cv={previewCV} />
      </div>
    </div>
  </div>
{/if}
