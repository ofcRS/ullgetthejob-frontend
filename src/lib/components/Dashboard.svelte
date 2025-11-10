<script lang="ts">
  import { onMount } from 'svelte'
  import {
    dashboardStats,
    dailyStrategies,
    marketInsights,
    isDashboardLoading,
    prioritizedStrategies,
    dismissStrategy
  } from '$lib/stores/dashboard.store'
  import { getDashboardStats, getDailyStrategies, getMarketInsights } from '$lib/api/dashboard.api'
  import { showError } from '$lib/stores/feedback.store'

  let refreshing = false

  async function loadDashboard() {
    $isDashboardLoading = true
    try {
      const [stats, strategies, insights] = await Promise.all([
        getDashboardStats(),
        getDailyStrategies(),
        getMarketInsights()
      ])

      $dashboardStats = stats
      $dailyStrategies = strategies
      $marketInsights = insights
    } catch (error) {
      showError('Dashboard Error', error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      $isDashboardLoading = false
    }
  }

  async function handleRefresh() {
    refreshing = true
    await loadDashboard()
    refreshing = false
  }

  function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  function getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      action: '🎯',
      insight: '💡',
      recommendation: '📋'
    }
    return icons[type] || '📊'
  }

  function getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
      up: '📈',
      down: '📉',
      stable: '➡️'
    }
    return icons[trend] || '📊'
  }

  onMount(() => {
    loadDashboard()
  })
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">AI Dashboard</h1>
      <p class="text-gray-600 mt-1">Your personalized job search insights</p>
    </div>
    <button
      on:click={handleRefresh}
      disabled={refreshing || $isDashboardLoading}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
    >
      <svg
        class="w-5 h-5 {refreshing ? 'animate-spin' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
  </div>

  {#if $isDashboardLoading && !$dashboardStats}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  {:else if $dashboardStats}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Total Applications</div>
        <div class="text-3xl font-bold text-gray-900">{$dashboardStats.totalApplications}</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Submitted</div>
        <div class="text-3xl font-bold text-green-600">{$dashboardStats.submittedCount}</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Success Rate</div>
        <div class="text-3xl font-bold text-blue-600">{$dashboardStats.successRate}%</div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-sm text-gray-600 mb-1">Avg Match Score</div>
        <div class="text-3xl font-bold text-purple-600">{$dashboardStats.avgMatchScore}%</div>
      </div>
    </div>

    <!-- Daily Strategies -->
    {#if $prioritizedStrategies.length > 0}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Daily Strategies</h2>
          <p class="text-sm text-gray-600 mt-1">AI-powered recommendations for today</p>
        </div>
        <div class="divide-y">
          {#each $prioritizedStrategies as strategy}
            <div class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">{getTypeIcon(strategy.type)}</span>
                    <h3 class="text-lg font-semibold text-gray-900">{strategy.title}</h3>
                    <span
                      class="px-2 py-1 text-xs rounded-full border {getPriorityColor(
                        strategy.priority
                      )}"
                    >
                      {strategy.priority}
                    </span>
                  </div>
                  <p class="text-gray-700">{strategy.description}</p>

                  {#if strategy.metadata}
                    <div class="mt-3 space-y-1 text-sm text-gray-600">
                      {#if strategy.metadata.skillsToImprove && strategy.metadata.skillsToImprove.length > 0}
                        <div>
                          <span class="font-medium">Skills to improve:</span>
                          {strategy.metadata.skillsToImprove.join(', ')}
                        </div>
                      {/if}
                      {#if strategy.metadata.estimatedImpact}
                        <div>
                          <span class="font-medium">Estimated impact:</span>
                          {strategy.metadata.estimatedImpact}
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
                <button
                  on:click={() => dismissStrategy(strategy.id)}
                  class="ml-4 text-gray-400 hover:text-gray-600"
                  title="Dismiss"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Market Insights -->
    {#if $marketInsights.length > 0}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Market Insights</h2>
          <p class="text-sm text-gray-600 mt-1">Current job market trends</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {#each $marketInsights as insight}
            <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <span class="text-2xl">{getTrendIcon(insight.trend)}</span>
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 mb-1">{insight.category}</h3>
                  <p class="text-sm text-gray-700">{insight.insight}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full transition-all"
                        style="width: {insight.confidence * 100}%"
                      />
                    </div>
                    <span class="text-xs text-gray-600"
                      >{Math.round(insight.confidence * 100)}% confidence</span
                    >
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Top Skills -->
    {#if $dashboardStats.topSkills.length > 0}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Top Skills in Demand</h2>
          <p class="text-sm text-gray-600 mt-1">Most requested skills in your job searches</p>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            {#each $dashboardStats.topSkills.slice(0, 10) as skill}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="font-medium text-gray-900">{skill.skill}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">{skill.count} jobs</span>
                    <span class="text-sm text-green-600">{skill.matchRate}% match</span>
                  </div>
                </div>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all"
                    style="width: {(skill.count / $dashboardStats.topSkills[0].count) * 100}%"
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Weekly Trend Chart -->
    {#if $dashboardStats.weeklyTrend.length > 0}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">Weekly Activity</h2>
          <p class="text-sm text-gray-600 mt-1">Your application activity over the past week</p>
        </div>
        <div class="p-6">
          <div class="flex items-end justify-between h-48 gap-2">
            {#each $dashboardStats.weeklyTrend as day}
              {@const maxApps = Math.max(...$dashboardStats.weeklyTrend.map(d => d.applications))}
              {@const height = maxApps > 0 ? (day.applications / maxApps) * 100 : 0}
              <div class="flex-1 flex flex-col items-center">
                <div class="w-full flex items-end justify-center gap-1 flex-1">
                  <div
                    class="bg-blue-600 rounded-t w-1/2 hover:bg-blue-700 transition-all cursor-pointer"
                    style="height: {height}%"
                    title="{day.applications} applications"
                  />
                  <div
                    class="bg-green-600 rounded-t w-1/2 hover:bg-green-700 transition-all cursor-pointer"
                    style="height: {maxApps > 0 ? (day.success / maxApps) * 100 : 0}%"
                    title="{day.success} successful"
                  />
                </div>
                <div class="text-xs text-gray-600 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            {/each}
          </div>
          <div class="flex items-center justify-center gap-4 mt-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-600 rounded" />
              <span class="text-sm text-gray-600">Applications</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-600 rounded" />
              <span class="text-sm text-gray-600">Successful</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-600">No data available. Start applying to jobs to see your dashboard!</p>
    </div>
  {/if}
</div>
