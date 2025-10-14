<script lang="ts">
  import type { ParsedCV, CustomizedCV } from '$lib/types'
  export let original: ParsedCV
  export let customized: CustomizedCV

  function tokenize(text: string) {
    return (text || '').split(/(\s+|[,.;:!\-\n]+)/).filter(Boolean)
  }

  function calculateDiff(orig: string = '', custom: string = '') {
    const o = tokenize(orig)
    const c = tokenize(custom)
    const dp: number[][] = Array(o.length + 1).fill(0).map(() => Array(c.length + 1).fill(0))
    for (let i = o.length - 1; i >= 0; i--) {
      for (let j = c.length - 1; j >= 0; j--) {
        if (o[i] === c[j]) dp[i][j] = dp[i + 1][j + 1] + 1
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
    const result: Array<{ type: 'same' | 'add' | 'rem'; text: string }> = []
    let i = 0, j = 0
    while (i < o.length && j < c.length) {
      if (o[i] === c[j]) {
        result.push({ type: 'same', text: o[i] })
        i++; j++
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: 'rem', text: o[i] })
        i++
      } else {
        result.push({ type: 'add', text: c[j] })
        j++
      }
    }
    while (i < o.length) result.push({ type: 'rem', text: o[i++] })
    while (j < c.length) result.push({ type: 'add', text: c[j++] })
    return result
  }

  $: experienceDiff = calculateDiff(original?.experience || '', customized?.experience || '')
  $: skillsAdded = (customized?.skills || []).filter((s) => !(original?.skills || []).includes(s))
  $: skillsRemoved = (original?.skills || []).filter((s) => !(customized?.skills || []).includes(s))
</script>

<div class="diff-container">
  <h3 class="font-semibold mb-3">Changes Made</h3>

  {#if skillsAdded.length}
    <div class="mb-4">
      <p class="font-semibold text-sm mb-1">Added Skills:</p>
      <div class="flex flex-wrap gap-2">
        {#each skillsAdded as skill}
          <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800">{skill}</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if skillsRemoved.length}
    <div class="mb-4">
      <p class="font-semibold text-sm mb-1">Deprioritized Skills:</p>
      <div class="flex flex-wrap gap-2">
        {#each skillsRemoved as skill}
          <span class="px-2 py-1 rounded text-xs bg-red-100 text-red-800">{skill}</span>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mb-2">
    <p class="font-semibold text-sm mb-1">Experience Changes:</p>
    <p class="text-sm leading-6">
      {#each experienceDiff as part}
        {#if part.type === 'same'}
          <span>{part.text}</span>
        {:else if part.type === 'add'}
          <mark class="bg-green-100 text-green-900 rounded px-0.5">{part.text}</mark>
        {:else}
          <del class="bg-red-50 text-red-700 rounded px-0.5">{part.text}</del>
        {/if}
      {/each}
    </p>
  </div>
</div>

<style>
  .diff-container mark {
    background-color: #dcfce7;
  }
  .diff-container del {
    background-color: #fef2f2;
  }
</style>


