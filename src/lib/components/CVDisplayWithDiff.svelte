<script lang="ts">
  import type { ParsedCV, CustomizedCV } from '$lib/types'

  export let original: ParsedCV
  export let customized: CustomizedCV

  function highlightDifferences(originalText: string, customizedText: string) {
    const origWords = new Set((originalText || '').toLowerCase().split(/\s+/).filter(Boolean))
    const customWords = (customizedText || '').split(/\s+/)
    return customWords.map((word) => {
      const lower = word.toLowerCase()
      const isNew = lower && !origWords.has(lower)
      return { text: word, isNew }
    })
  }

  $: experienceDiff = highlightDifferences(original?.experience || '', customized?.experience || '')
</script>

<div class="cv-diff">
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900">
      {customized.firstName} {customized.lastName}
    </h2>
    {#if customized.title}
      <p class="text-lg text-gray-600 mt-1 {customized.title !== original.title ? 'bg-emerald-100 px-2 py-1 rounded' : ''}">
        {customized.title}
      </p>
    {/if}
  </div>

  {#if customized.summary}
    <section class="mb-6">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">Summary</h3>
      <p class="text-sm leading-relaxed">
        {#if customized.summary !== original.summary}
          <mark class="bg-emerald-100 text-gray-900 px-1 rounded">{customized.summary}</mark>
        {:else}
          {customized.summary}
        {/if}
      </p>
    </section>
  {/if}

  {#if customized.skills?.length}
    <section class="mb-6">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">Skills</h3>
      <div class="flex flex-wrap gap-2">
        {#each customized.skills as skill}
          {@const isNew = !(original.skills || []).includes(skill)}
          <span class="px-2 py-1 rounded text-xs font-medium {isNew ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' : 'bg-gray-100 text-gray-700'}">
            {#if isNew}<span class="mr-1">+</span>{/if}
            {skill}
          </span>
        {/each}
      </div>
    </section>
  {/if}

  {#if customized.experience}
    <section>
      <h3 class="font-semibold text-sm text-gray-700 mb-2">Work Experience</h3>
      <div class="text-sm leading-relaxed space-y-1">
        {#each experienceDiff as d}
          <span class="{d.isNew ? 'bg-emerald-100 px-0.5 rounded' : ''}">{d.text}</span>
        {/each}
      </div>
    </section>
  {/if}
</div>


