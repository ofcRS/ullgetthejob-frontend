/**
 * Custom API Error class for structured error handling
 */
export class APIError extends Error {
	constructor(
		public code: string,
		public message: string,
		public statusCode: number,
		public details?: any
	) {
		super(message)
		this.name = 'APIError'
		Object.setPrototypeOf(this, APIError.prototype)
	}

	/**
	 * Check if error is a network error (no response from server)
	 */
	isNetworkError(): boolean {
		return this.statusCode === 0
	}

	/**
	 * Check if error is an authentication error
	 */
	isAuthError(): boolean {
		return this.statusCode === 401 || this.statusCode === 403
	}

	/**
	 * Check if error is a validation error
	 */
	isValidationError(): boolean {
		return this.statusCode === 400 || this.statusCode === 422
	}

	/**
	 * Check if error is a server error
	 */
	isServerError(): boolean {
		return this.statusCode >= 500
	}

	/**
	 * Get user-friendly error message
	 */
	getUserMessage(): string {
		if (this.isNetworkError()) {
			return 'Network error. Please check your connection.'
		}
		if (this.isAuthError()) {
			return 'Authentication required. Please log in.'
		}
		if (this.isServerError()) {
			return 'Server error. Please try again later.'
		}
		return this.message
	}
}

/**
 * Create API error from fetch response
 */
export async function createAPIError(response: Response): Promise<APIError> {
	let errorData: any = {
		code: 'UNKNOWN_ERROR',
		message: `Request failed with status ${response.status}`
	}

	try {
		const text = await response.text()
		if (text) {
			errorData = JSON.parse(text)
		}
	} catch (e) {
		// If response is not JSON, use default error
	}

	return new APIError(
		errorData.code || 'UNKNOWN_ERROR',
		errorData.message || errorData.error || `HTTP ${response.status}`,
		response.status,
		errorData.details
	)
}

/**
 * Create network error
 */
export function createNetworkError(error: Error): APIError {
	return new APIError('NETWORK_ERROR', error.message || 'Network request failed', 0)
}
