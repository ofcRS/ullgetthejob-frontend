<script lang="ts">
  export let currentStep: number

  const steps = [
    { number: 1, label: 'Upload CV', path: '/upload' },
    { number: 2, label: 'Search Jobs', path: '/search' },
    { number: 3, label: 'Customize', path: '/jobs' },
    { number: 4, label: 'Apply', path: '/application' }
  ]
</script>

<nav class="flex justify-center mb-8">
  <ol class="flex items-center space-x-4">
    {#each steps as step, i}
      <li class="flex items-center">
        <a 
          href={step.path}
          class="flex items-center {currentStep === step.number ? 'text-blue-600' : 'text-gray-400'}"
        >
          <span class="flex items-center justify-center w-8 h-8 rounded-full border-2 
            {currentStep === step.number ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}">
            {step.number}
          </span>
          <span class="ml-2 text-sm font-medium">{step.label}</span>
        </a>
        {#if i < steps.length - 1}
          <svg class="w-6 h-6 ml-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        {/if}
      </li>
    {/each}
  </ol>
  </nav>


