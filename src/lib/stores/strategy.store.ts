import { writable, derived, get } from 'svelte/store'
import type { ApplicationStrategy, JobPriority } from '$lib/types'

// Current application strategy
export const currentStrategy = writable<ApplicationStrategy | null>(null)

// Loading state
export const isGeneratingStrategy = writable<boolean>(false)

// Strategy preferences
export const strategyPreferences = writable<{
  targetCompanies: string[]
  preferredSchedule: string[]
  salaryRange: { min?: number; max?: number }
  maxApplicationsPerDay: number
}>({
  targetCompanies: [],
  preferredSchedule: [],
  salaryRange: {},
  maxApplicationsPerDay: 5
})

// Derived stores
export const immediateJobs = derived(currentStrategy, $strategy =>
  $strategy?.recommendedOrder.filter(jp => jp.priority === 'immediate') || []
)

export const highPriorityJobs = derived(currentStrategy, $strategy =>
  $strategy?.recommendedOrder.filter(jp => jp.priority === 'high') || []
)

export const mediumPriorityJobs = derived(currentStrategy, $strategy =>
  $strategy?.recommendedOrder.filter(jp => jp.priority === 'medium') || []
)

export const lowPriorityJobs = derived(currentStrategy, $strategy =>
  $strategy?.recommendedOrder.filter(jp => jp.priority === 'low') || []
)

export const sortedJobs = derived(currentStrategy, $strategy => {
  if (!$strategy) return []

  const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 }
  return [...$strategy.recommendedOrder].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return b.score - a.score
  })
})

// Strategy functions
export function setStrategy(strategy: ApplicationStrategy) {
  currentStrategy.set(strategy)
}

export function clearStrategy() {
  currentStrategy.set(null)
}

export function updatePreferences(
  preferences: Partial<{
    targetCompanies: string[]
    preferredSchedule: string[]
    salaryRange: { min?: number; max?: number }
    maxApplicationsPerDay: number
  }>
) {
  strategyPreferences.update(current => ({
    ...current,
    ...preferences
  }))
}

export function getJobPriority(jobId: string): JobPriority | undefined {
  const strategy = get(currentStrategy)
  return strategy?.recommendedOrder.find(jp => jp.job.id === jobId)
}

export function reorderJobs(newOrder: JobPriority[]) {
  currentStrategy.update(strategy => {
    if (!strategy) return strategy
    return {
      ...strategy,
      recommendedOrder: newOrder
    }
  })
}
