import { writable, get } from 'svelte/store'
import type { JobItem } from '$lib/types'
import type { CustomizedCV } from '$lib/types'
import { submitApplication } from '$lib/api/cv.api'

export const jobs = writable<JobItem[]>([])
export const selectedJob = writable<JobItem | null>(null)
export const isSearching = writable<boolean>(false)

/**
 * Enhanced job store with optimistic updates
 */
interface OptimisticUpdate {
	id: string
	jobId: string
	type: 'apply'
	timestamp: number
}

class JobsStoreClass {
	private optimisticUpdates = new Map<string, OptimisticUpdate>()

	/**
	 * Apply to job with optimistic UI update
	 */
	async applyToJob(
		jobId: string,
		customizedCV: CustomizedCV,
		coverLetter: string
	): Promise<{ success: boolean; error?: string }> {
		const tempId = crypto.randomUUID()

		// Optimistic update: mark job as "applying"
		const currentJobs = get(jobs)
		const jobIndex = currentJobs.findIndex((j) => j.id === jobId || j.hh_vacancy_id === jobId)

		if (jobIndex !== -1) {
			const updatedJobs = [...currentJobs]
			updatedJobs[jobIndex] = {
				...updatedJobs[jobIndex],
				applicationStatus: 'applying'
			} as JobItem & { applicationStatus?: string }
			jobs.set(updatedJobs)
		}

		// Track optimistic update
		this.optimisticUpdates.set(tempId, {
			id: tempId,
			jobId,
			type: 'apply',
			timestamp: Date.now()
		})

		try {
			// Make actual API call
			const result = (await submitApplication({
				jobExternalId: jobId,
				customizedCV,
				coverLetter
			})) as { success: boolean; error?: string }

			// Remove optimistic update
			this.optimisticUpdates.delete(tempId)

			if (result.success) {
				// Update with real data
				const currentJobs = get(jobs)
				const jobIndex = currentJobs.findIndex((j) => j.id === jobId || j.hh_vacancy_id === jobId)

				if (jobIndex !== -1) {
					const updatedJobs = [...currentJobs]
					updatedJobs[jobIndex] = {
						...updatedJobs[jobIndex],
						applicationStatus: 'submitted'
					} as JobItem & { applicationStatus?: string }
					jobs.set(updatedJobs)
				}

				return { success: true }
			} else {
				// Rollback on error
				const currentJobs = get(jobs)
				const jobIndex = currentJobs.findIndex((j) => j.id === jobId || j.hh_vacancy_id === jobId)

				if (jobIndex !== -1) {
					const updatedJobs = [...currentJobs]
					const jobWithStatus = updatedJobs[jobIndex] as JobItem & { applicationStatus?: string }
					delete jobWithStatus.applicationStatus
					jobs.set(updatedJobs)
				}

				return { success: false, error: result.error || 'Application failed' }
			}
		} catch (error) {
			// Rollback on error
			this.optimisticUpdates.delete(tempId)

			const currentJobs = get(jobs)
			const jobIndex = currentJobs.findIndex((j) => j.id === jobId || j.hh_vacancy_id === jobId)

			if (jobIndex !== -1) {
				const updatedJobs = [...currentJobs]
				const jobWithStatus = updatedJobs[jobIndex] as JobItem & { applicationStatus?: string }
				delete jobWithStatus.applicationStatus
				jobs.set(updatedJobs)
			}

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Application failed'
			}
		}
	}

	/**
	 * Get pending optimistic updates count
	 */
	getPendingUpdatesCount(): number {
		return this.optimisticUpdates.size
	}

	/**
	 * Clear all optimistic updates
	 */
	clearOptimisticUpdates(): void {
		this.optimisticUpdates.clear()
	}
}

export const jobsStore = new JobsStoreClass()


