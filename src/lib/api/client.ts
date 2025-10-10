class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    const response = await fetch(`${this.baseURL}${path}`, { ...options, headers })
    if (!response.ok) {
      const error = await response.json()
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
}

export const api = new APIClient(import.meta.env.VITE_API_URL || 'http://localhost:3000')
