import type { CustomizedCV, ParsedCV } from '$lib/types'
import { apiClient, APIError } from './client'

export async function uploadCv(
	file: File
): Promise<{ success: boolean; cv?: ParsedCV; id?: string; error?: string }> {
	try {
		const form = new FormData()
		form.append('file', file)
		const result = await apiClient.post<{ success: boolean; cv?: ParsedCV; id?: string }>(
			'/api/cv/upload',
			form,
			{ timeout: 60000 } // 60 second timeout for file upload
		)
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, error: error.getUserMessage() }
		}
		return { success: false, error: 'An unexpected error occurred' }
	}
}

export async function customizeCv(params: {
	cv: ParsedCV
	jobDescription: string
	model?: string
}): Promise<{
	success: boolean
	customizedCV?: CustomizedCV
	coverLetter?: string
	modelUsed?: string
	jobSkills?: string[]
	error?: string
}> {
	try {
		const result = await apiClient.post<{
			success: boolean
			customizedCV?: CustomizedCV
			coverLetter?: string
			modelUsed?: string
			jobSkills?: string[]
		}>('/api/cv/customize', params, { timeout: 60000 })
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, error: error.getUserMessage() }
		}
		return { success: false, error: 'An unexpected error occurred' }
	}
}

export async function listCvs(): Promise<{ success: boolean; items?: any[]; error?: string }> {
	try {
		const result = await apiClient.get<{ success: boolean; items?: any[] }>('/api/cv')
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, error: error.getUserMessage() }
		}
		return { success: false, error: 'An unexpected error occurred' }
	}
}

export async function submitApplication(params: {
	jobExternalId: string
	customizedCV: CustomizedCV
	coverLetter: string
}) {
	try {
		const result = await apiClient.post('/api/application/submit', params, { timeout: 30000 })
		return result
	} catch (error) {
		if (error instanceof APIError) {
			return { success: false, error: error.getUserMessage() }
		}
		return { success: false, error: 'An unexpected error occurred' }
	}
}


