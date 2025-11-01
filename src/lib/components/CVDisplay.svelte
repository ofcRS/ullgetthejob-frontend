<script lang="ts">
  import SkillChip from './SkillChip.svelte'
  import type { ParsedCV } from '$lib/types'
  export let cv: ParsedCV

  const normalizeText = (value: unknown): string => {
    if (value == null) return ''
    if (typeof value === 'string') return value
    if (Array.isArray(value)) {
      return value
        .map((entry) => normalizeText(entry))
        .filter((entry) => entry.trim().length > 0)
        .join('\n\n')
    }
    if (typeof value === 'object') {
      const parts = Object.values(value as Record<string, unknown>)
        .map((entry) => normalizeText(entry))
        .filter((entry) => entry.trim().length > 0)
      return parts.join(', ')
    }
    return String(value)
  }

  const toHtml = (value: unknown) => {
    const text = normalizeText(value)
    return text ? text.replace(/\n/g, '<br>') : ''
  }

  $: experienceHtml = toHtml(cv?.experience)
  $: educationHtml = toHtml(cv?.education)
</script>

<div class="cv-display card bg-white">
  <div class="border-b pb-4 mb-6">
    <h1 class="text-3xl font-bold text-gray-900">
      {cv.firstName} {cv.lastName}
    </h1>
    {#if cv.title}
      <p class="text-lg text-gray-600 mt-1">{cv.title}</p>
    {/if}
    <div class="flex gap-4 mt-2 text-sm text-gray-500">
      {#if cv.email}
        <span>📧 {cv.email}</span>
      {/if}
      {#if cv.phone}
        <span>📱 {cv.phone}</span>
      {/if}
    </div>
  </div>

  {#if cv.summary}
    <section class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-gray-700 leading-relaxed">{cv.summary}</p>
    </section>
  {/if}

  {#if cv.skills && cv.skills.length > 0}
    <section class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Skills</h2>
      <div class="flex flex-wrap gap-2">
        {#each cv.skills as skill}
          <SkillChip {skill} />
        {/each}
      </div>
    </section>
  {/if}

  {#if experienceHtml}
    <section class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Work Experience</h2>
      <div class="prose prose-sm max-w-none">
        {@html experienceHtml}
      </div>
    </section>
  {/if}

  {#if educationHtml}
    <section class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Education</h2>
      <div class="prose prose-sm max-w-none">
        {@html educationHtml}
      </div>
    </section>
  {/if}
</div>


