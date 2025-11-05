import type { ModelInfo } from '$lib/types'
import { apiClient, APIError } from './client'

export async function fetchModels(): Promise<ModelInfo[]> {
	try {
		const result = await apiClient.get<{ models: ModelInfo[] }>('/api/models')
		return result.models || []
	} catch (error) {
		console.error('Failed to fetch models:', error)
		return []
	}
}


