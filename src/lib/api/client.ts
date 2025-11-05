import { auth } from '../auth/store'
import { APIError, createAPIError, createNetworkError } from './errors'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface RequestConfig extends RequestInit {
	timeout?: number
	retries?: number
	retryDelay?: number
	skipAuth?: boolean
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>
type ErrorInterceptor = (error: APIError) => APIError | Promise<APIError>

/**
 * Centralized API client with interceptors, error handling, and request deduplication
 */
class APIClient {
	private baseURL: string = API_URL
	private requestQueue: Map<string, Promise<any>> = new Map()
	private requestInterceptors: RequestInterceptor[] = []
	private responseInterceptors: ResponseInterceptor[] = []
	private errorInterceptors: ErrorInterceptor[] = []

	/**
	 * Make an API request with automatic error handling
	 */
	async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
		const {
			timeout = 30000,
			retries = 0,
			retryDelay = 1000,
			skipAuth = false,
			...fetchConfig
		} = config

		// Create request key for deduplication
		const requestKey = this.createRequestKey(path, fetchConfig)

		// Return existing request if identical request is in flight
		if (this.requestQueue.has(requestKey)) {
			return this.requestQueue.get(requestKey)!
		}

		// Create new request promise
		const requestPromise = this._executeRequest<T>(path, {
			...fetchConfig,
			timeout,
			retries,
			retryDelay,
			skipAuth
		})

		// Store in queue
		this.requestQueue.set(requestKey, requestPromise)

		try {
			const result = await requestPromise
			return result
		} finally {
			// Remove from queue when complete
			this.requestQueue.delete(requestKey)
		}
	}

	/**
	 * Execute the actual HTTP request with retries
	 */
	private async _executeRequest<T>(
		path: string,
		config: RequestConfig,
		attempt = 0
	): Promise<T> {
		try {
			// Apply request interceptors
			let finalConfig = { ...config }
			for (const interceptor of this.requestInterceptors) {
				finalConfig = await interceptor(finalConfig)
			}

			// Add default headers
			const headers = new Headers(finalConfig.headers)
			if (!headers.has('Content-Type') && !(finalConfig.body instanceof FormData)) {
				headers.set('Content-Type', 'application/json')
			}

			// Add credentials for cookie-based auth
			if (!finalConfig.skipAuth) {
				finalConfig.credentials = 'include'
			}

			finalConfig.headers = headers

			// Create abort controller for timeout
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000)

			try {
				// Make the request
				let response = await fetch(`${this.baseURL}${path}`, {
					...finalConfig,
					signal: controller.signal
				})

				// Apply response interceptors
				for (const interceptor of this.responseInterceptors) {
					response = await interceptor(response)
				}

				// Handle authentication errors
				if (response.status === 401 || response.status === 403) {
					// Trigger logout
					auth.logout()
					throw await createAPIError(response)
				}

				// Handle other errors
				if (!response.ok) {
					throw await createAPIError(response)
				}

				// Parse response
				const contentType = response.headers.get('content-type')
				if (contentType && contentType.includes('application/json')) {
					return await response.json()
				} else {
					return (await response.text()) as any
				}
			} finally {
				clearTimeout(timeoutId)
			}
		} catch (error) {
			let apiError: APIError

			if (error instanceof APIError) {
				apiError = error
			} else if (error instanceof Error) {
				if (error.name === 'AbortError') {
					apiError = new APIError('TIMEOUT', 'Request timeout', 408)
				} else {
					apiError = createNetworkError(error)
				}
			} else {
				apiError = new APIError('UNKNOWN_ERROR', 'Unknown error occurred', 500)
			}

			// Apply error interceptors
			for (const interceptor of this.errorInterceptors) {
				apiError = await interceptor(apiError)
			}

			// Retry logic for network errors and server errors
			if (
				attempt < (config.retries || 0) &&
				(apiError.isNetworkError() || apiError.isServerError())
			) {
				await this.delay((config.retryDelay || 1000) * Math.pow(2, attempt))
				return this._executeRequest<T>(path, config, attempt + 1)
			}

			throw apiError
		}
	}

	/**
	 * Convenience methods for common HTTP verbs
	 */
	async get<T>(path: string, config?: RequestConfig): Promise<T> {
		return this.request<T>(path, { ...config, method: 'GET' })
	}

	async post<T>(path: string, body?: any, config?: RequestConfig): Promise<T> {
		return this.request<T>(path, {
			...config,
			method: 'POST',
			body: body instanceof FormData ? body : JSON.stringify(body)
		})
	}

	async put<T>(path: string, body?: any, config?: RequestConfig): Promise<T> {
		return this.request<T>(path, {
			...config,
			method: 'PUT',
			body: JSON.stringify(body)
		})
	}

	async patch<T>(path: string, body?: any, config?: RequestConfig): Promise<T> {
		return this.request<T>(path, {
			...config,
			method: 'PATCH',
			body: JSON.stringify(body)
		})
	}

	async delete<T>(path: string, config?: RequestConfig): Promise<T> {
		return this.request<T>(path, { ...config, method: 'DELETE' })
	}

	/**
	 * Add request interceptor
	 */
	addRequestInterceptor(interceptor: RequestInterceptor): void {
		this.requestInterceptors.push(interceptor)
	}

	/**
	 * Add response interceptor
	 */
	addResponseInterceptor(interceptor: ResponseInterceptor): void {
		this.responseInterceptors.push(interceptor)
	}

	/**
	 * Add error interceptor
	 */
	addErrorInterceptor(interceptor: ErrorInterceptor): void {
		this.errorInterceptors.push(interceptor)
	}

	/**
	 * Create unique key for request deduplication
	 */
	private createRequestKey(path: string, config: RequestInit): string {
		const method = config.method || 'GET'
		const bodyKey =
			config.body instanceof FormData ? 'FormData' : JSON.stringify(config.body)
		return `${method}:${path}:${bodyKey}`
	}

	/**
	 * Delay helper for retries
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms))
	}

	/**
	 * Set base URL (useful for testing)
	 */
	setBaseURL(url: string): void {
		this.baseURL = url
	}

	/**
	 * Get current base URL
	 */
	getBaseURL(): string {
		return this.baseURL
	}
}

// Export singleton instance
export const apiClient = new APIClient()

// Add default request interceptor for logging in development
if (import.meta.env.DEV) {
	apiClient.addRequestInterceptor((config) => {
		console.log(`[API] ${config.method || 'GET'} ${config}`)
		return config
	})

	apiClient.addErrorInterceptor((error) => {
		console.error(`[API Error] ${error.code}: ${error.message}`, error)
		return error
	})
}

// Export for convenience
export { APIError } from './errors'
