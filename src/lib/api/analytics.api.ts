import { apiClient } from './client'
import type { AnalyticsData, ApplicationData } from '$lib/stores/analytics.store'

export interface APIResponse<T = any> {
	success: boolean
	data?: T
	error?: string
	message?: string
}

export interface AnalyticsFilters {
	startDate?: string
	endDate?: string
	status?: string[]
	minMatchScore?: number
	companies?: string[]
}

/**
 * Fetch analytics overview data
 */
export async function getAnalyticsOverview(filters?: AnalyticsFilters): Promise<APIResponse<AnalyticsData>> {
	try {
		const queryParams = new URLSearchParams()
		if (filters?.startDate) queryParams.append('startDate', filters.startDate)
		if (filters?.endDate) queryParams.append('endDate', filters.endDate)
		if (filters?.status) queryParams.append('status', filters.status.join(','))
		if (filters?.minMatchScore) queryParams.append('minMatchScore', filters.minMatchScore.toString())
		if (filters?.companies) queryParams.append('companies', filters.companies.join(','))

		const query = queryParams.toString()
		const path = `/api/analytics/overview${query ? `?${query}` : ''}`

		const response = await apiClient.get<APIResponse<AnalyticsData>>(path)
		return response
	} catch (error) {
		console.error('Failed to fetch analytics overview:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch analytics overview'
		}
	}
}

/**
 * Fetch applications list with filters
 */
export async function getApplicationsList(filters?: AnalyticsFilters): Promise<APIResponse<ApplicationData[]>> {
	try {
		const queryParams = new URLSearchParams()
		if (filters?.startDate) queryParams.append('startDate', filters.startDate)
		if (filters?.endDate) queryParams.append('endDate', filters.endDate)
		if (filters?.status) queryParams.append('status', filters.status.join(','))
		if (filters?.minMatchScore) queryParams.append('minMatchScore', filters.minMatchScore.toString())
		if (filters?.companies) queryParams.append('companies', filters.companies.join(','))

		const query = queryParams.toString()
		const path = `/api/analytics/applications${query ? `?${query}` : ''}`

		const response = await apiClient.get<APIResponse<ApplicationData[]>>(path)
		return response
	} catch (error) {
		console.error('Failed to fetch applications list:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch applications list'
		}
	}
}

/**
 * Export analytics data to CSV
 */
export async function exportToCSV(filters?: AnalyticsFilters): Promise<Blob | null> {
	try {
		const queryParams = new URLSearchParams()
		if (filters?.startDate) queryParams.append('startDate', filters.startDate)
		if (filters?.endDate) queryParams.append('endDate', filters.endDate)
		if (filters?.status) queryParams.append('status', filters.status.join(','))
		if (filters?.minMatchScore) queryParams.append('minMatchScore', filters.minMatchScore.toString())
		if (filters?.companies) queryParams.append('companies', filters.companies.join(','))

		const query = queryParams.toString()
		const path = `/api/analytics/export/csv${query ? `?${query}` : ''}`

		// Custom fetch for blob response
		const response = await fetch(`${apiClient.getBaseURL()}${path}`, {
			credentials: 'include'
		})

		if (!response.ok) {
			throw new Error('Export failed')
		}

		return await response.blob()
	} catch (error) {
		console.error('Failed to export CSV:', error)
		return null
	}
}

/**
 * Get insights and recommendations
 */
export async function getInsights(): Promise<APIResponse<{
	insights: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>
	recommendations: Array<{ title: string; action: string }>
}>> {
	try {
		const response = await apiClient.get<APIResponse>('/api/analytics/insights')
		return response
	} catch (error) {
		console.error('Failed to fetch insights:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch insights'
		}
	}
}

/**
 * Generate mock analytics data (for development/testing)
 */
export function generateMockAnalytics(): AnalyticsData {
	const companies = ['Acme Corp', 'TechStart Inc', 'Digital Solutions', 'Cloud Systems', 'Data Dynamics']
	const statuses: ApplicationData['status'][] = ['pending', 'submitted', 'rejected', 'interview', 'accepted']
	const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git', 'REST API']

	const applications: ApplicationData[] = []
	const now = Date.now()
	const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

	// Generate 50 mock applications over the last 30 days
	for (let i = 0; i < 50; i++) {
		const appliedAt = new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo))
		const status = statuses[Math.floor(Math.random() * statuses.length)]
		const matchScore = Math.floor(Math.random() * 40) + 60 // 60-100%
		const company = companies[Math.floor(Math.random() * companies.length)]

		const responseAt = status !== 'pending' && status !== 'submitted'
			? new Date(appliedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
			: undefined

		applications.push({
			id: `app-${i}`,
			jobTitle: `${['Senior', 'Mid-level', 'Junior'][Math.floor(Math.random() * 3)]} ${['Frontend', 'Backend', 'Full Stack'][Math.floor(Math.random() * 3)]} Developer`,
			company,
			status,
			appliedAt: appliedAt.toISOString(),
			responseAt,
			matchScore,
			skills: skills.slice(0, Math.floor(Math.random() * 5) + 3) // 3-8 random skills
		})
	}

	// Calculate stats
	const totalApplications = applications.length
	const successfulApplications = applications.filter(app => app.status === 'accepted').length
	const pendingApplications = applications.filter(app => app.status === 'pending').length
	const rejectedApplications = applications.filter(app => app.status === 'rejected').length
	const interviewRequests = applications.filter(app => app.status === 'interview' || app.status === 'accepted').length

	const avgMatchScore = applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length

	const responseTimes = applications
		.filter(app => app.responseAt && app.appliedAt)
		.map(app => (new Date(app.responseAt!).getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60))
	const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

	const responsesReceived = applications.filter(app => app.status !== 'pending' && app.status !== 'submitted').length
	const responseRate = (responsesReceived / totalApplications) * 100

	return {
		applications,
		totalApplications,
		successfulApplications,
		pendingApplications,
		rejectedApplications,
		interviewRequests,
		avgMatchScore: Math.round(avgMatchScore * 10) / 10,
		avgResponseTime: Math.round(avgResponseTime * 10) / 10,
		responseRate: Math.round(responseRate * 10) / 10,
		lastUpdated: new Date().toISOString()
	}
}
