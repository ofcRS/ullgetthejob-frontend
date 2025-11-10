import { apiClient } from './client'
import type { ApplicationStrategy, JobItem, ParsedCV } from '$lib/types'

export async function generateApplicationStrategy(
  jobs: JobItem[],
  cv: ParsedCV,
  preferences?: {
    targetCompanies?: string[]
    preferredSchedule?: string[]
    salaryRange?: { min?: number; max?: number }
    maxApplicationsPerDay?: number
  }
): Promise<ApplicationStrategy> {
  return apiClient.post<ApplicationStrategy>(
    '/api/strategy/generate',
    {
      jobs,
      cv,
      preferences
    },
    { timeout: 45000 }
  )
}

export async function optimizeApplicationOrder(jobIds: string[]): Promise<{
  optimizedOrder: string[]
  reasoning: Record<string, string>
}> {
  return apiClient.post<{
    optimizedOrder: string[]
    reasoning: Record<string, string>
  }>('/api/strategy/optimize-order', { jobIds })
}

export async function getBestApplyTiming(jobId: string): Promise<{
  bestDay: string
  bestTime: string
  confidence: number
  reasoning: string
}> {
  return apiClient.get<{
    bestDay: string
    bestTime: string
    confidence: number
    reasoning: string
  }>(`/api/strategy/timing/${jobId}`)
}

export async function getPersonalizedTips(cv: ParsedCV, targetJobs: JobItem[]): Promise<{
  cvImprovements: string[]
  skillsToLearn: string[]
  experienceGaps: string[]
  marketAdvice: string[]
}> {
  return apiClient.post<{
    cvImprovements: string[]
    skillsToLearn: string[]
    experienceGaps: string[]
    marketAdvice: string[]
  }>(
    '/api/strategy/personalized-tips',
    {
      cv,
      targetJobs
    },
    { timeout: 30000 }
  )
}
