<script lang="ts">
  export let progress: number // 0-100

  $: barColor = progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-amber-500' : 'bg-emerald-500'
</script>

<div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
  <div
    class="{barColor} h-4 rounded-full transition-all duration-500 flex items-center justify-center"
    style="width: {progress}%"
  >
    {#if progress > 10}
      <span class="text-xs font-semibold text-white">{progress}%</span>
    {/if}
  </div>
</div>
