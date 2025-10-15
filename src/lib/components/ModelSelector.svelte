<script lang="ts">
  import { selectedModel } from '$lib/stores/cv.store'
  import type { ModelInfo } from '$lib/types'
  import { onMount } from 'svelte'

  let models: ModelInfo[] = []
  let isLoading = true
  let showDetails = false

  $: selected = models.find(m => m.id === $selectedModel)

  onMount(async () => {
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const res = await fetch(`${api}/api/models`)
      const data = await res.json()
      if (data?.success && Array.isArray(data.models)) {
        models = data.models
      }
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      isLoading = false
    }
  })
</script>

<div class="model-selector">
  <label class="label flex items-center justify-between" for="model-select">
    <span>AI Model</span>
    <button 
      type="button"
      on:click={() => showDetails = !showDetails}
      class="text-xs text-blue-600 hover:text-blue-700"
    >
      {showDetails ? 'Hide' : 'Show'} details
    </button>
  </label>
  
  {#if isLoading}
    <div class="input bg-gray-50 text-gray-500">Loading models...</div>
  {:else}
    <select 
      id="model-select" 
      bind:value={$selectedModel} 
      class="input w-full"
    >
      {#each models as model}
        <option value={model.id}>{model.name} ({model.provider})</option>
      {/each}
    </select>
  {/if}

  {#if showDetails && selected && !isLoading}
    <div class="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700">
      <p><span class="font-semibold">Selected:</span> {selected.name} ({selected.provider})</p>
      {#if selected.description}
        <p class="mt-1 text-gray-600">{selected.description}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .model-selector {
    width: 100%;
  }
  
</style>


