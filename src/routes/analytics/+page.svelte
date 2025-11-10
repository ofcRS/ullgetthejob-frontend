<script lang="ts">
  import { onMount } from 'svelte'
  import { derived } from 'svelte/store'
  import LineChart from '$lib/components/charts/LineChart.svelte'
  import BarChart from '$lib/components/charts/BarChart.svelte'
  import DoughnutChart from '$lib/components/charts/DoughnutChart.svelte'
  import StatCard from '$lib/components/StatCard.svelte'
  import {
    analyticsData,
    isLoadingAnalytics,
    dateRange,
    applicationsOverTime,
    statusDistribution,
    topSkills,
    companyStats,
    successByDayOfWeek,
    responseTimeDistribution,
    matchScoreCorrelation,
    setAnalyticsData
  } from '$lib/stores/analytics.store'
  import { getAnalyticsOverview, generateMockAnalytics, exportToCSV } from '$lib/api/analytics.api'
  import { showSuccess, showError } from '$lib/stores/notifications.store'
  import { getWebSocketClient } from '$lib/stores/ws.store'

  let selectedPeriod: '7d' | '30d' | '90d' | 'all' = '30d'
  let isExporting = false

  // Derived chart data
  $: timeSeriesChart = derived(applicationsOverTime, ($data) => ({
    labels: $data.map(d => {
      const date = new Date(d.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        label: 'Applications',
        data: $data.map(d => d.applications),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Success',
        data: $data.map(d => d.success),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }))

  $: statusChart = derived(statusDistribution, ($data) => ({
    labels: ['Pending', 'Submitted', 'Interview', 'Rejected', 'Accepted'],
    datasets: [
      {
        data: [$data.pending, $data.submitted, $data.interview, $data.rejected, $data.accepted],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',  // Pending - amber
          'rgba(59, 130, 246, 0.8)',   // Submitted - blue
          'rgba(139, 92, 246, 0.8)',   // Interview - purple
          'rgba(239, 68, 68, 0.8)',    // Rejected - red
          'rgba(16, 185, 129, 0.8)'    // Accepted - green
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(239, 68, 68)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2
      }
    ]
  }))

  $: skillsChart = derived(topSkills, ($data) => ({
    labels: $data.map(s => s.skill),
    datasets: [
      {
        label: 'Demand Count',
        data: $data.map(s => s.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Success Rate (%)',
        data: $data.map(s => s.successRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      }
    ]
  }))

  $: dayOfWeekChart = derived(successByDayOfWeek, ($data) => ({
    labels: $data.map(d => d.day.substring(0, 3)),
    datasets: [
      {
        label: 'Applications',
        data: $data.map(d => d.applications),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Success Rate (%)',
        data: $data.map(d => d.successRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      }
    ]
  }))

  $: responseTimeChart = derived(responseTimeDistribution, ($data) => ({
    labels: $data.map(b => b.label),
    datasets: [
      {
        label: 'Applications',
        data: $data.map(b => b.count),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  }))

  $: matchScoreChart = derived(matchScoreCorrelation, ($data) => ({
    labels: $data.map(b => b.range),
    datasets: [
      {
        label: 'Applications',
        data: $data.map(b => b.applications),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Success Rate (%)',
        data: $data.map(b => b.successRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      }
    ]
  }))

  onMount(async () => {
    await loadAnalytics()
    setupRealTimeUpdates()
  })

  async function loadAnalytics() {
    isLoadingAnalytics.set(true)

    try {
      // Try to load from API
      const result = await getAnalyticsOverview({
        startDate: $dateRange.start.toISOString(),
        endDate: $dateRange.end.toISOString()
      })

      if (result.success && result.data) {
        setAnalyticsData(result.data)
      } else {
        // Fallback to mock data for development
        console.log('Using mock analytics data')
        const mockData = generateMockAnalytics()
        setAnalyticsData(mockData)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Use mock data as fallback
      const mockData = generateMockAnalytics()
      setAnalyticsData(mockData)
    } finally {
      isLoadingAnalytics.set(false)
    }
  }

  function setupRealTimeUpdates() {
    const wsClient = getWebSocketClient()
    if (!wsClient) return

    // Listen for application submitted events
    wsClient.on('application_submitted', () => {
      // Reload analytics after a slight delay
      setTimeout(() => loadAnalytics(), 1000)
    })

    // Listen for application response events
    wsClient.on('application_response', () => {
      setTimeout(() => loadAnalytics(), 1000)
    })
  }

  function changePeriod(period: typeof selectedPeriod) {
    selectedPeriod = period
    const now = new Date()
    const start = new Date()

    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7)
        break
      case '30d':
        start.setDate(now.getDate() - 30)
        break
      case '90d':
        start.setDate(now.getDate() - 90)
        break
      case 'all':
        start.setFullYear(2020, 0, 1) // Far back date
        break
    }

    dateRange.set({ start, end: now })
    loadAnalytics()
  }

  async function handleExport() {
    isExporting = true

    try {
      const blob = await exportToCSV({
        startDate: $dateRange.start.toISOString(),
        endDate: $dateRange.end.toISOString()
      })

      if (blob) {
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        showSuccess('Export Complete', 'Analytics data has been exported to CSV')
      } else {
        showError('Export Failed', 'Failed to export analytics data')
      }
    } catch (error) {
      console.error('Export error:', error)
      showError('Export Failed', 'An error occurred during export')
    } finally {
      isExporting = false
    }
  }

  async function handleRefresh() {
    await loadAnalytics()
    showSuccess('Refreshed', 'Analytics data has been refreshed')
  }
</script>

<svelte:head>
  <title>Analytics Dashboard - UllGetTheJob</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
      <p class="text-gray-600">Track your application performance and insights</p>
    </div>

    <div class="flex items-center gap-3">
      <!-- Period Selector -->
      <div class="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
        <button
          class="px-3 py-1.5 text-sm rounded {selectedPeriod === '7d' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => changePeriod('7d')}
        >
          7 Days
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded {selectedPeriod === '30d' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => changePeriod('30d')}
        >
          30 Days
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded {selectedPeriod === '90d' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => changePeriod('90d')}
        >
          90 Days
        </button>
        <button
          class="px-3 py-1.5 text-sm rounded {selectedPeriod === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
          on:click={() => changePeriod('all')}
        >
          All Time
        </button>
      </div>

      <!-- Actions -->
      <button
        class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        on:click={handleRefresh}
        disabled={$isLoadingAnalytics}
      >
        <svg class="w-5 h-5 inline-block {$isLoadingAnalytics ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>

      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        on:click={handleExport}
        disabled={isExporting || $isLoadingAnalytics}
      >
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>
    </div>
  </div>

  {#if $isLoadingAnalytics}
    <div class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Applications"
        value={$analyticsData.totalApplications}
        icon="📊"
        color="blue"
      />
      <StatCard
        title="Interview Requests"
        value={$analyticsData.interviewRequests}
        subtitle="{(($analyticsData.interviewRequests / $analyticsData.totalApplications) * 100).toFixed(1)}% success rate"
        icon="🎉"
        color="green"
      />
      <StatCard
        title="Avg Match Score"
        value="{$analyticsData.avgMatchScore}%"
        icon="🎯"
        color="purple"
      />
      <StatCard
        title="Avg Response Time"
        value="{$analyticsData.avgResponseTime}h"
        subtitle="{$analyticsData.responseRate}% response rate"
        icon="⏱️"
        color="yellow"
      />
    </div>

    <!-- Main Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Applications Over Time -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Applications Over Time</h3>
        <LineChart data={$timeSeriesChart} height={300} />
      </div>

      <!-- Status Distribution -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Application Status</h3>
        <DoughnutChart data={$statusChart} height={300} />
      </div>

      <!-- Top Skills -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Top Skills in Demand</h3>
        <BarChart data={$skillsChart} height={300} />
      </div>

      <!-- Success by Day of Week -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Success by Day of Week</h3>
        <BarChart data={$dayOfWeekChart} height={300} />
      </div>

      <!-- Response Time Distribution -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Response Time Distribution</h3>
        <BarChart data={$responseTimeChart} height={300} />
      </div>

      <!-- Match Score Correlation -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Match Score vs Success Rate</h3>
        <BarChart data={$matchScoreChart} height={300} />
      </div>
    </div>

    <!-- Company Stats Table -->
    <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Top Companies</h3>
      {#if $companyStats.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Applications</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Success Rate</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Avg Response Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each $companyStats as company}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{company.company}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{company.applications}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {company.successRate >= 50 ? 'bg-emerald-100 text-emerald-800' : company.successRate >= 25 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}">
                      {company.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {company.avgResponseTime > 0 ? `${company.avgResponseTime.toFixed(1)}h` : 'N/A'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-gray-500 text-center py-8">No company data available</p>
      {/if}
    </div>

    <!-- Last Updated -->
    <div class="text-center text-sm text-gray-500 mt-6">
      Last updated: {new Date($analyticsData.lastUpdated).toLocaleString()}
    </div>
  {/if}
</div>
