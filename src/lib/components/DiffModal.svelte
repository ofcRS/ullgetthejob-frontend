<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import CVDiff from './CVDiff.svelte'
  import type { ParsedCV, CustomizedCV } from '$lib/types'

  export let original: ParsedCV
  export let customized: CustomizedCV
  export let isOpen = false

  const dispatch = createEventDispatcher()

  function close() {
    dispatch('close')
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close()
    }
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      close()
    }
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 modal-backdrop"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    role="button"
    tabindex="0"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col modal-content">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">Detailed Changes</h2>
        <button 
          on:click={close}
          class="text-gray-400 hover:text-gray-600 transition-colors p-2"
          aria-label="Close modal"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <CVDiff {original} {customized} />
      </div>

      <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
        <button on:click={close} class="btn btn-secondary">
          Close
        </button>
      </div>
    </div>
  </div>
{/if}


