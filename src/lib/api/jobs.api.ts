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


