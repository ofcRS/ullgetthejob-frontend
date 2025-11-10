import { writable, derived } from 'svelte/store'

export interface ApplicationData {
	id: string
	jobTitle: string
	company: string
	status: 'pending' | 'submitted' | 'rejected' | 'interview' | 'accepted'
	appliedAt: string
	responseAt?: string
	matchScore?: number
	skills: string[]
}

export interface AnalyticsData {
	applications: ApplicationData[]
	totalApplications: number
	successfulApplications: number
	pendingApplications: number
	rejectedApplications: number
	interviewRequests: number
	avgMatchScore: number
	avgResponseTime: number // in hours
	responseRate: number // percentage
	lastUpdated: string
}

export interface DailyStats {
	date: string
	applications: number
	success: number
	rejected: number
}

export interface SkillDemand {
	skill: string
	count: number
	successRate: number
}

export interface CompanyStats {
	company: string
	applications: number
	successRate: number
	avgResponseTime: number
}

// Initial state
const initialState: AnalyticsData = {
	applications: [],
	totalApplications: 0,
	successfulApplications: 0,
	pendingApplications: 0,
	rejectedApplications: 0,
	interviewRequests: 0,
	avgMatchScore: 0,
	avgResponseTime: 0,
	responseRate: 0,
	lastUpdated: new Date().toISOString()
}

// Main analytics store
export const analyticsData = writable<AnalyticsData>(initialState)

// Loading state
export const isLoadingAnalytics = writable<boolean>(false)

// Date range filter
export const dateRange = writable<{ start: Date; end: Date }>({
	start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
	end: new Date()
})

/**
 * Derived store: Applications over time (daily)
 */
export const applicationsOverTime = derived(
	[analyticsData, dateRange],
	([$data, $range]) => {
		const dailyStats = new Map<string, DailyStats>()

		// Initialize all dates in range
		const currentDate = new Date($range.start)
		while (currentDate <= $range.end) {
			const dateStr = currentDate.toISOString().split('T')[0]
			dailyStats.set(dateStr, {
				date: dateStr,
				applications: 0,
				success: 0,
				rejected: 0
			})
			currentDate.setDate(currentDate.getDate() + 1)
		}

		// Fill in actual data
		$data.applications.forEach((app) => {
			const dateStr = app.appliedAt.split('T')[0]
			const stats = dailyStats.get(dateStr)
			if (stats) {
				stats.applications++
				if (app.status === 'interview' || app.status === 'accepted') {
					stats.success++
				} else if (app.status === 'rejected') {
					stats.rejected++
				}
			}
		})

		return Array.from(dailyStats.values()).sort((a, b) =>
			a.date.localeCompare(b.date)
		)
	}
)

/**
 * Derived store: Status distribution for pie chart
 */
export const statusDistribution = derived(analyticsData, ($data) => {
	return {
		pending: $data.pendingApplications,
		submitted: $data.totalApplications - $data.successfulApplications - $data.rejectedApplications - $data.pendingApplications,
		interview: $data.interviewRequests,
		rejected: $data.rejectedApplications,
		accepted: $data.successfulApplications
	}
})

/**
 * Derived store: Top skills in demand
 */
export const topSkills = derived(analyticsData, ($data) => {
	const skillStats = new Map<string, { count: number; success: number }>()

	$data.applications.forEach((app) => {
		app.skills.forEach((skill) => {
			const stats = skillStats.get(skill) || { count: 0, success: 0 }
			stats.count++
			if (app.status === 'interview' || app.status === 'accepted') {
				stats.success++
			}
			skillStats.set(skill, stats)
		})
	})

	const skills: SkillDemand[] = Array.from(skillStats.entries())
		.map(([skill, stats]) => ({
			skill,
			count: stats.count,
			successRate: stats.count > 0 ? (stats.success / stats.count) * 100 : 0
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10)

	return skills
})

/**
 * Derived store: Company statistics
 */
export const companyStats = derived(analyticsData, ($data) => {
	const companies = new Map<string, {
		applications: number
		success: number
		responseTimes: number[]
	}>()

	$data.applications.forEach((app) => {
		const stats = companies.get(app.company) || {
			applications: 0,
			success: 0,
			responseTimes: []
		}

		stats.applications++
		if (app.status === 'interview' || app.status === 'accepted') {
			stats.success++
		}

		if (app.responseAt && app.appliedAt) {
			const responseTime =
				(new Date(app.responseAt).getTime() - new Date(app.appliedAt).getTime()) /
				(1000 * 60 * 60) // Convert to hours
			stats.responseTimes.push(responseTime)
		}

		companies.set(app.company, stats)
	})

	const companyList: CompanyStats[] = Array.from(companies.entries())
		.map(([company, stats]) => ({
			company,
			applications: stats.applications,
			successRate: stats.applications > 0 ? (stats.success / stats.applications) * 100 : 0,
			avgResponseTime:
				stats.responseTimes.length > 0
					? stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length
					: 0
		}))
		.sort((a, b) => b.applications - a.applications)
		.slice(0, 10)

	return companyList
})

/**
 * Derived store: Success rate by day of week
 */
export const successByDayOfWeek = derived(analyticsData, ($data) => {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const dayStats = days.map(day => ({ day, applications: 0, success: 0 }))

	$data.applications.forEach((app) => {
		const dayOfWeek = new Date(app.appliedAt).getDay()
		dayStats[dayOfWeek].applications++
		if (app.status === 'interview' || app.status === 'accepted') {
			dayStats[dayOfWeek].success++
		}
	})

	return dayStats.map(stat => ({
		day: stat.day,
		applications: stat.applications,
		successRate: stat.applications > 0 ? (stat.success / stat.applications) * 100 : 0
	}))
})

/**
 * Derived store: Response time distribution
 */
export const responseTimeDistribution = derived(analyticsData, ($data) => {
	const buckets = [
		{ label: '< 24h', min: 0, max: 24, count: 0 },
		{ label: '1-3 days', min: 24, max: 72, count: 0 },
		{ label: '3-7 days', min: 72, max: 168, count: 0 },
		{ label: '1-2 weeks', min: 168, max: 336, count: 0 },
		{ label: '> 2 weeks', min: 336, max: Infinity, count: 0 }
	]

	$data.applications.forEach((app) => {
		if (app.responseAt && app.appliedAt) {
			const responseTime =
				(new Date(app.responseAt).getTime() - new Date(app.appliedAt).getTime()) /
				(1000 * 60 * 60) // Convert to hours

			const bucket = buckets.find(b => responseTime >= b.min && responseTime < b.max)
			if (bucket) {
				bucket.count++
			}
		}
	})

	return buckets
})

/**
 * Derived store: Match score correlation with success
 */
export const matchScoreCorrelation = derived(analyticsData, ($data) => {
	const buckets = [
		{ range: '0-20%', min: 0, max: 20, applications: 0, success: 0 },
		{ range: '20-40%', min: 20, max: 40, applications: 0, success: 0 },
		{ range: '40-60%', min: 40, max: 60, applications: 0, success: 0 },
		{ range: '60-80%', min: 60, max: 80, applications: 0, success: 0 },
		{ range: '80-100%', min: 80, max: 100, applications: 0, success: 0 }
	]

	$data.applications.forEach((app) => {
		if (app.matchScore !== undefined) {
			const bucket = buckets.find(b => app.matchScore! >= b.min && app.matchScore! < b.max)
			if (bucket) {
				bucket.applications++
				if (app.status === 'interview' || app.status === 'accepted') {
					bucket.success++
				}
			}
		}
	})

	return buckets.map(bucket => ({
		range: bucket.range,
		applications: bucket.applications,
		successRate: bucket.applications > 0 ? (bucket.success / bucket.applications) * 100 : 0
	}))
})

/**
 * Update analytics data with new application
 */
export function addApplicationToAnalytics(application: ApplicationData) {
	analyticsData.update(data => {
		const updatedApplications = [...data.applications, application]
		return recalculateStats(updatedApplications)
	})
}

/**
 * Update application status in analytics
 */
export function updateApplicationStatus(
	applicationId: string,
	status: ApplicationData['status'],
	responseAt?: string
) {
	analyticsData.update(data => {
		const updatedApplications = data.applications.map(app =>
			app.id === applicationId
				? { ...app, status, responseAt: responseAt || app.responseAt }
				: app
		)
		return recalculateStats(updatedApplications)
	})
}

/**
 * Recalculate aggregate statistics
 */
function recalculateStats(applications: ApplicationData[]): AnalyticsData {
	const totalApplications = applications.length
	const successfulApplications = applications.filter(
		app => app.status === 'accepted'
	).length
	const pendingApplications = applications.filter(
		app => app.status === 'pending'
	).length
	const rejectedApplications = applications.filter(
		app => app.status === 'rejected'
	).length
	const interviewRequests = applications.filter(
		app => app.status === 'interview' || app.status === 'accepted'
	).length

	// Calculate average match score
	const scoresWithData = applications.filter(app => app.matchScore !== undefined)
	const avgMatchScore =
		scoresWithData.length > 0
			? scoresWithData.reduce((sum, app) => sum + (app.matchScore || 0), 0) / scoresWithData.length
			: 0

	// Calculate average response time (in hours)
	const responseTimes = applications
		.filter(app => app.responseAt && app.appliedAt)
		.map(app =>
			(new Date(app.responseAt!).getTime() - new Date(app.appliedAt).getTime()) /
			(1000 * 60 * 60)
		)
	const avgResponseTime =
		responseTimes.length > 0
			? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
			: 0

	// Calculate response rate
	const responsesReceived = applications.filter(
		app => app.status !== 'pending' && app.status !== 'submitted'
	).length
	const responseRate =
		totalApplications > 0
			? (responsesReceived / totalApplications) * 100
			: 0

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

/**
 * Set analytics data (for loading from API)
 */
export function setAnalyticsData(data: AnalyticsData) {
	analyticsData.set(data)
}

/**
 * Clear analytics data
 */
export function clearAnalyticsData() {
	analyticsData.set(initialState)
}
