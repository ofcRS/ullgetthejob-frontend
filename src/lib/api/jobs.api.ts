import type { JobItem } from '$lib/types'
import { apiClient, APIError } from './client'

export async function searchJobs(params: {
	text: string
	area?: string
	experience?: string
	employment?: string
	schedule?: string
}): Promise<{
	success: boolean
	jobs: JobItem[]
	total?: number
	error?: string
}> {
	try {
		const result = await apiClient.post<{
			success: boolean
			jobs: JobItem[]
			total?: number
		}>('/api/jobs/search', params, {
			timeout: 30000,
			retries: 2, // Retry failed job searches
			retryDelay: 1000
		})
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, jobs: [], error: error.getUserMessage() }
		}
		return { success: false, jobs: [], error: 'An unexpected error occurred' }
	}
}

export async function getJobDetails(
	id: string
): Promise<{ success: boolean; job?: JobItem; error?: string }> {
	try {
		const result = await apiClient.get<{ success: boolean; job?: JobItem }>(
			`/api/jobs/${encodeURIComponent(id)}`
		)
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, error: error.getUserMessage() }
		}
		return { success: false, error: 'Failed to load job details' }
	}
}


