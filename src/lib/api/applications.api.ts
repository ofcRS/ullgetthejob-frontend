import { apiClient, APIError } from './client'
import type { ApplicationStatus, RateLimitStatus } from '$lib/types'

// TODO: Replace with actual user ID from auth
const getUserId = () => 'test_user'

export async function submitApplication(data: {
  jobId: string
  cvId: string
  customCvId?: string
  coverLetter?: string
}): Promise<{
  success: boolean
  applicationId?: string
  error?: string
}> {
  try {
    return await apiClient.post('/api/application', {
      userId: getUserId(),
      ...data
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to submit application'
    }
  }
}

export async function getApplications(filters?: {
  status?: string
  limit?: number
}): Promise<{
  success: boolean
  applications?: ApplicationStatus[]
  error?: string
}> {
  try {
    const params = new URLSearchParams({ userId: getUserId() })
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    return await apiClient.get(`/api/application?${params}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to fetch applications'
    }
  }
}

export async function retryApplication(applicationId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    return await apiClient.post(`/api/application/${applicationId}/retry`, {})
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to retry application'
    }
  }
}

export async function getRateLimitStatus(): Promise<{
  success: boolean
  rateLimit?: RateLimitStatus
  error?: string
}> {
  try {
    const params = new URLSearchParams({ userId: getUserId() })
    return await apiClient.get(`/api/rate-limit/status?${params}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to fetch rate limit status'
    }
  }
}
