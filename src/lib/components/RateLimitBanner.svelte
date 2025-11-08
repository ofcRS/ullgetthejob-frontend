<script lang="ts">
  export let tokens: number
  export let capacity: number
  export let nextRefill: string
  export let canApply: boolean

  $: percentage = Math.round((tokens / capacity) * 100)
  $: barColor = tokens > 10 ? 'bg-emerald-500' : tokens > 5 ? 'bg-amber-500' : 'bg-red-500'
  $: timeUntilRefill = getTimeUntilRefill(nextRefill)

  function getTimeUntilRefill(refillTime: string): string {
    const now = new Date()
    const refill = new Date(refillTime)
    const diff = refill.getTime() - now.getTime()

    if (diff <= 0) return 'Now'

    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minutes`

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
</script>

<div class="p-4 rounded-lg mb-6 {canApply ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gradient-to-r from-amber-50 to-orange-50'} border border-gray-200 shadow-sm">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="text-2xl">{canApply ? '🟢' : '⏸️'}</div>
      <div>
        <h3 class="font-semibold text-gray-900">Rate Limit Status</h3>
        <p class="text-sm text-gray-600">
          {tokens}/{capacity} applications available
        </p>
      </div>
    </div>

    <div class="text-right">
      <div class="text-sm text-gray-600">Next refill in:</div>
      <div class="text-lg font-semibold text-gray-900">{timeUntilRefill}</div>
    </div>
  </div>

  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      class="{barColor} h-3 rounded-full transition-all duration-500"
      style="width: {percentage}%"
    ></div>
  </div>

  {#if !canApply}
    <div class="mt-3 text-sm text-amber-700">
      ⚠️ Rate limit reached. Auto-apply will resume automatically when tokens refill.
    </div>
  {/if}
</div>
