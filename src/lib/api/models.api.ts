import type { ModelInfo } from '$lib/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchModels(): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${API_URL}/api/models`)
    if (!res.ok) return []
    const data = await res.json()
    return data.models || []
  } catch {
    return []
  }
}


