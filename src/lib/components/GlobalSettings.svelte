<script lang="ts">
  import ModelSelector from './ModelSelector.svelte'
  let isOpen = false

  function toggleSettings() {
    isOpen = !isOpen
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.settings-container')) {
      isOpen = false
    }
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (!isOpen) return
    if (event.key === 'Escape') {
      isOpen = false
    }
  }
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleWindowKeydown} />

<div class="settings-container fixed bottom-20 right-6 z-40">
  <button 
    on:click|stopPropagation={toggleSettings}
    class="settings-button btn btn-secondary shadow-lg flex items-center gap-2"
    aria-label="Open settings"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span class="hidden sm:inline">Settings</span>
  </button>

  {#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div 
      class="settings-panel absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[320px]"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
    >
      <h3 class="font-semibold text-lg mb-4 text-gray-900">Global Settings</h3>
      
      <div class="space-y-4">
        <ModelSelector />
        
        <div class="pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            These settings apply to all CV customization and generation tasks.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-button {
    transition: all 0.2s ease;
  }
  .settings-button:hover {
    transform: translateY(-2px);
  }
  .settings-panel {
    animation: slideUp 0.2s ease-out;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>


