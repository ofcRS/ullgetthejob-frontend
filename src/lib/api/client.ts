import { browser } from '$app/environment'

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (browser) {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (browser) {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    }

    const response = await fetch(`${this.baseURL}${path}`, { ...options, headers })

    if (response.status === 401) {
      // Token expired or invalid, clear it
      this.setToken(null)
      throw new Error('Unauthorized - please log in again')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || 'Request failed')
    }

    return await response.json()
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' })
  }

  async post<T>(path: string, data: any): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(data) })
  }

  async uploadCV(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/cvs/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: formData
    })

    if (response.status === 401) {
      this.setToken(null)
      throw new Error('Unauthorized - please log in again')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || 'Upload failed')
    }

    return await response.json()
  }

  async startWorkflow(cvId: string, searchParams: any, maxApplications: number = 50): Promise<any> {
    return this.post('/workflow/start', {
      cvId,
      searchParams,
      maxApplications
    })
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    return this.get(`/workflow/status/${workflowId}`)
  }

  async stopWorkflow(workflowId: string): Promise<any> {
    return this.request(`/workflow/stop/${workflowId}`, { method: 'POST' })
  }

  async getApplications(filters?: { status?: string; limit?: number; offset?: number }): Promise<any[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    return this.get(`/applications?${params.toString()}`)
  }
}

export const api = new APIClient(import.meta.env.VITE_API_URL || 'http://localhost:3000')
