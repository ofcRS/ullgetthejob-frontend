import { writable, derived } from 'svelte/store'
import type { QueuedJob } from '$lib/types'

export const queuedJobs = writable<QueuedJob[]>([])
export const selectedJobIds = writable<Set<string>>(new Set())

export const selectedJobs = derived(
  [queuedJobs, selectedJobIds],
  ([$jobs, $selected]) => $jobs.filter(job => $selected.has(job.id))
)

export const queueStats = derived(queuedJobs, ($jobs) => ({
  total: $jobs.length,
  pending: $jobs.filter(j => j.status === 'pending').length,
  customizing: $jobs.filter(j => j.status === 'customizing').length,
  ready: $jobs.filter(j => j.status === 'ready').length,
  submitting: $jobs.filter(j => j.status === 'submitting').length,
  submitted: $jobs.filter(j => j.status === 'submitted').length,
  failed: $jobs.filter(j => j.status === 'failed').length,
  rateLimited: $jobs.filter(j => j.status === 'rate_limited').length
}))
