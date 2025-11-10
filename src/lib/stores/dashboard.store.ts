import { writable, derived } from 'svelte/store'
import type { DashboardStats, DailyStrategy, MarketInsight } from '$lib/types'

// Dashboard statistics
export const dashboardStats = writable<DashboardStats | null>(null)

// Daily strategies
export const dailyStrategies = writable<DailyStrategy[]>([])

// Market insights
export const marketInsights = writable<MarketInsight[]>([])

// Loading states
export const isDashboardLoading = writable<boolean>(false)
export const lastRefreshed = writable<string | null>(null)

// Dismissed strategies (stored in localStorage)
function createDismissedStore() {
  const store = writable<Set<string>>(new Set())

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dismissed_strategies')
    if (stored) {
      try {
        store.set(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error('Failed to parse dismissed strategies:', e)
      }
    }

    store.subscribe((value) => {
      localStorage.setItem('dismissed_strategies', JSON.stringify(Array.from(value)))
    })
  }

  return store
}

export const dismissedStrategies = createDismissedStore()

// Visible strategies (filtered by dismissed)
export const visibleStrategies = derived(
  [dailyStrategies, dismissedStrategies],
  ([$strategies, $dismissed]) => {
    return $strategies.filter(s => !$dismissed.has(s.id))
  }
)

// Prioritized strategies
export const prioritizedStrategies = derived(visibleStrategies, ($strategies) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...$strategies].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

// Dashboard functions
export function dismissStrategy(strategyId: string) {
  dismissedStrategies.update(dismissed => {
    dismissed.add(strategyId)
    return dismissed
  })
}

export function resetDismissed() {
  dismissedStrategies.set(new Set())
}

export function updateStats(stats: DashboardStats) {
  dashboardStats.set(stats)
  lastRefreshed.set(new Date().toISOString())
}

export function updateStrategies(strategies: DailyStrategy[]) {
  dailyStrategies.set(strategies)
}

export function updateInsights(insights: MarketInsight[]) {
  marketInsights.set(insights)
}
