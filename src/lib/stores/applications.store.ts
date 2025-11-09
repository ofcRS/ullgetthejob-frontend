import { writable, derived } from 'svelte/store'
import type { ApplicationStatus } from '$lib/types'

export const applications = writable<ApplicationStatus[]>([])

export const applicationStats = derived(applications, ($apps) => ({
  total: $apps.length,
  pending: $apps.filter(a => a.status === 'pending').length,
  submitted: $apps.filter(a => a.status === 'submitted' || a.submittedAt).length,
  failed: $apps.filter(a => a.status === 'failed').length,
  today: $apps.filter(a => {
    if (!a.submittedAt) return false
    const today = new Date()
    const submitted = new Date(a.submittedAt)
    return today.toDateString() === submitted.toDateString()
  }).length
}))
