<script lang="ts">
  export let title: string
  export let value: string | number
  export let subtitle: string = ''
  export let icon: string = ''
  export let trend: 'up' | 'down' | 'neutral' | null = null
  export let trendValue: string = ''
  export let color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' = 'blue'

  $: colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  }

  $: trendIcon = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  $: trendColor = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }
</script>

<div class="stat-card {colorClasses[color]}">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        {#if icon}
          <span class="text-xl">{icon}</span>
        {/if}
        <h3 class="text-sm font-medium text-gray-600">{title}</h3>
      </div>

      <div class="text-3xl font-bold mb-1">{value}</div>

      {#if subtitle}
        <p class="text-sm text-gray-600">{subtitle}</p>
      {/if}

      {#if trend && trendValue}
        <div class="flex items-center gap-1 mt-2 text-sm">
          <span class="{trendColor[trend]} font-medium">
            {trendIcon[trend]} {trendValue}
          </span>
          <span class="text-gray-500">vs last period</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .stat-card {
    @apply rounded-lg border-2 p-6 transition-all duration-200;
    @apply hover:shadow-md;
  }
</style>
