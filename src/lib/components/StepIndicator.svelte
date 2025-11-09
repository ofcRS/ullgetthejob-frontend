<script lang="ts">
  import { queueStats } from '$lib/stores/queue.store'

  export let currentStep: number

  const steps = [
    { number: 1, label: 'Upload CV', path: '/upload' },
    { number: 2, label: 'Search Jobs', path: '/search' },
    { number: 3, label: 'Customize', path: '/jobs' },
    { number: 4, label: 'Apply', path: '/application' }
  ]
</script>

<nav class="mb-8">
  <div class="flex items-center justify-between mb-4">
    <a href="/" class="font-bold text-xl text-gray-900">UllGetTheJob</a>

    <div class="flex items-center gap-4">
      <a href="/queue" class="text-gray-700 hover:text-blue-600 transition-colors relative">
        Queue
        {#if $queueStats.total > 0}
          <span class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {$queueStats.total}
          </span>
        {/if}
      </a>
      <a href="/applications" class="text-gray-700 hover:text-blue-600 transition-colors">
        Applications
      </a>
    </div>
  </div>

  <div class="flex items-center justify-center gap-3">
    {#each steps as step, i}
      <div class="flex items-center gap-3">
        <a href={step.path} class="flex flex-col items-center gap-2 group">
          <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
            {currentStep > step.number
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : currentStep === step.number
              ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
              : 'bg-gray-100 text-gray-400'}">
            {#if currentStep > step.number}
              ✓
            {:else}
              {step.number}
            {/if}
          </div>
          <span class="text-sm font-medium {currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}">
            {step.label}
          </span>
        </a>
        {#if i < steps.length - 1}
          <div class="w-24 h-1 rounded-full transition-all duration-500 {currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'}" />
        {/if}
      </div>
    {/each}
  </div>
</nav>


