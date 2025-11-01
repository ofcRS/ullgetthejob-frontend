import type { JobItem } from '$lib/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function searchJobs(params: { text: string; area?: string; experience?: string; employment?: string; schedule?: string }): Promise<{
  success: boolean
  jobs: JobItem[]
  total?: number
  error?: string
}>{
  const res = await fetch(`${API_URL}/api/jobs/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return await res.json()
}

export async function getJobDetails(id: string): Promise<{ success: boolean; job?: JobItem; error?: string }>{
  try {
    const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(id)}`)
    if (!res.ok) {
      const errorBody = await res.text()
      return { success: false, error: `Job detail request failed: ${res.status} - ${errorBody}` }
    }
    return await res.json()
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load job details' }
  }
}


