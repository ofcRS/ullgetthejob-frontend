<script lang="ts">
  import { uploadedCv } from '$lib/stores/cv.store'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(() => {
    if (!$uploadedCv) goto('/upload')
  })
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <h1 class="text-3xl font-bold mb-4">Your Parsed CV</h1>
  {#if $uploadedCv}
    <CVDisplay cv={$uploadedCv} />
  {:else}
    <p class="text-gray-600">No CV uploaded yet. <a class="text-blue-600" href="/upload">Upload now</a>.</p>
  {/if}
</div>


