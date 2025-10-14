import { writable } from 'svelte/store'
import type { JobItem } from '$lib/types'

export const jobs = writable<JobItem[]>([])
export const selectedJob = writable<JobItem | null>(null)
export const isSearching = writable<boolean>(false)


