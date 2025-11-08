import { apiClient, APIError } from './client'
import type { QueuedJob } from '$lib/types'

// TODO: Replace with actual user ID from auth
const getUserId = () => 'test_user'

export async function addToQueue(jobIds: string[], cvId: string): Promise<{
  success: boolean
  workflowId?: string
  queuedCount?: number
  error?: string
}> {
  try {
    return await apiClient.post('/api/queue/add', {
      userId: getUserId(),
      cvId,
      jobIds
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to add to queue'
    }
  }
}

export async function getQueue(filters?: {
  workflowId?: string
  status?: string
}): Promise<{
  success: boolean
  items?: QueuedJob[]
  error?: string
}> {
  try {
    const params = new URLSearchParams({
      userId: getUserId(),
      ...(filters || {})
    })
    return await apiClient.get(`/api/queue?${params}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to fetch queue'
    }
  }
}

export async function removeFromQueue(itemId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    return await apiClient.delete(`/api/queue/${itemId}`)
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to remove from queue'
    }
  }
}

export async function startBatchCustomize(workflowId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    return await apiClient.post('/api/queue/batch-customize', {
      workflowId,
      userId: getUserId()
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to start batch customize'
    }
  }
}

export async function startAutoApply(workflowId: string): Promise<{
  success: boolean
  estimatedCompletion?: string
  error?: string
}> {
  try {
    return await apiClient.post('/api/queue/start-workflow', {
      workflowId,
      userId: getUserId()
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof APIError ? error.message : 'Failed to start auto-apply'
    }
  }
}
