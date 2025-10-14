<script lang="ts">
  import '../app.css'
  import StepIndicator from '$lib/components/StepIndicator.svelte'
  import { page } from '$app/stores'

  $: currentStep = (() => {
    const p = $page.url.pathname
    if (p.startsWith('/upload')) return 1
    if (p.startsWith('/search')) return 2
    if (p.startsWith('/jobs')) return 3
    if (p.startsWith('/application')) return 4
    return 1
  })()
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <div class="container mx-auto px-4 py-6 max-w-screen-2xl">
    <StepIndicator {currentStep} />
    <slot />
  </div>
  </div>