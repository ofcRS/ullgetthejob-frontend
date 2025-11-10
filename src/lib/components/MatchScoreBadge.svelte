<script lang="ts">
  import type { MatchScore } from '$lib/types'

  export let score: MatchScore | undefined
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let showDetails = false

  function getBadgeColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-300'
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      excellent: 'Excellent Match',
      good: 'Good Match',
      fair: 'Fair Match',
      poor: 'Poor Match'
    }
    return labels[category] || category
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      excellent: '🎯',
      good: '✅',
      fair: '⚡',
      poor: '⚠️'
    }
    return icons[category] || '📊'
  }

  $: sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }
</script>

{#if score}
  <div class="inline-block">
    <div
      class="inline-flex items-center gap-2 font-semibold rounded-full border-2 {getBadgeColor(
        score.percentage
      )} {sizeClasses[size]}"
    >
      <span>{getCategoryIcon(score.category)}</span>
      <span>{score.percentage}%</span>
    </div>

    {#if showDetails}
      <div class="mt-2 text-sm space-y-1">
        <div class="font-medium text-gray-700">
          {getCategoryLabel(score.category)}
        </div>

        {#if score.matched.length > 0}
          <div class="text-green-700">
            <span class="font-medium">Matched:</span>
            {score.matched.slice(0, 5).join(', ')}
            {#if score.matched.length > 5}
              <span class="text-gray-500">+{score.matched.length - 5} more</span>
            {/if}
          </div>
        {/if}

        {#if score.unmatched.length > 0}
          <div class="text-red-700">
            <span class="font-medium">Missing:</span>
            {score.unmatched.slice(0, 5).join(', ')}
            {#if score.unmatched.length > 5}
              <span class="text-gray-500">+{score.unmatched.length - 5} more</span>
            {/if}
          </div>
        {/if}

        {#if score.matchDetails}
          <div class="text-xs text-gray-600 mt-1">
            {#if score.matchDetails.exact.length > 0}
              <span class="text-green-600">{score.matchDetails.exact.length} exact</span>
            {/if}
            {#if score.matchDetails.synonym.length > 0}
              <span class="text-blue-600">{score.matchDetails.synonym.length} synonym</span>
            {/if}
            {#if score.matchDetails.fuzzy.length > 0}
              <span class="text-yellow-600">{score.matchDetails.fuzzy.length} fuzzy</span>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
