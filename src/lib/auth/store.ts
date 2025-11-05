import { writable, derived, get } from 'svelte/store'
import { goto } from '$app/navigation'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface User {
	id: string
	email?: string
	name?: string
	hhConnected?: boolean
}

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	sessionExpiresAt: number | null
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: true,
	sessionExpiresAt: null
}

class AuthStore {
	private state = writable<AuthState>(initialState)
	private checkInterval: number | null = null

	// Public stores
	readonly subscribe = this.state.subscribe
	readonly isAuthenticated = derived(this.state, ($state) => $state.isAuthenticated)
	readonly user = derived(this.state, ($state) => $state.user)
	readonly isLoading = derived(this.state, ($state) => $state.isLoading)

	constructor() {
		// Check authentication on initialization
		if (typeof window !== 'undefined') {
			this.checkAuth()
			this.startSessionMonitoring()
		}
	}

	/**
	 * Check authentication status from backend
	 * Uses httpOnly cookies for security
	 */
	async checkAuth(): Promise<boolean> {
		this.state.update((s) => ({ ...s, isLoading: true }))

		try {
			const res = await fetch(`${API_URL}/api/auth/status`, {
				credentials: 'include' // Include httpOnly cookies
			})

			if (res.ok) {
				const data = await res.json()
				this.state.set({
					user: data.user,
					isAuthenticated: true,
					isLoading: false,
					sessionExpiresAt: data.expiresAt ? Date.now() + data.expiresAt * 1000 : null
				})
				return true
			} else {
				this.state.set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					sessionExpiresAt: null
				})
				return false
			}
		} catch (error) {
			console.error('Auth check failed:', error)
			this.state.set({
				user: null,
				isAuthenticated: false,
				isLoading: false,
				sessionExpiresAt: null
			})
			return false
		}
	}

	/**
	 * Login with email and password
	 */
	async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
		try {
			const res = await fetch(`${API_URL}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include', // Receive httpOnly cookies
				body: JSON.stringify({ email, password })
			})

			if (res.ok) {
				await this.checkAuth()
				return { success: true }
			} else {
				const error = await res.json()
				return { success: false, error: error.message || 'Login failed' }
			}
		} catch (error) {
			return { success: false, error: 'Network error' }
		}
	}

	/**
	 * Logout and clear session
	 */
	async logout(): Promise<void> {
		try {
			await fetch(`${API_URL}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include'
			})
		} catch (error) {
			console.error('Logout request failed:', error)
		}

		// Clear state regardless of API response
		this.state.set({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			sessionExpiresAt: null
		})

		// Clear local storage
		if (typeof window !== 'undefined') {
			sessionStorage.clear()
			localStorage.removeItem('ugtj_selectedModel')
		}

		goto('/login')
	}

	/**
	 * Monitor session expiry and refresh if needed
	 */
	private startSessionMonitoring() {
		if (typeof window === 'undefined') return

		// Check every 30 seconds
		this.checkInterval = window.setInterval(
			() => {
				const state = get(this.state)

				// If session expires soon (within 5 minutes), refresh
				if (state.sessionExpiresAt && Date.now() > state.sessionExpiresAt - 300000) {
					this.refreshSession()
				}
			},
			30000
		)
	}

	/**
	 * Refresh session to extend expiry
	 */
	private async refreshSession() {
		try {
			const res = await fetch(`${API_URL}/api/auth/refresh`, {
				method: 'POST',
				credentials: 'include'
			})

			if (res.ok) {
				const data = await res.json()
				this.state.update((s) => ({
					...s,
					sessionExpiresAt: data.expiresAt ? Date.now() + data.expiresAt * 1000 : null
				}))
			}
		} catch (error) {
			console.error('Session refresh failed:', error)
		}
	}

	/**
	 * Handle HH.ru OAuth callback
	 */
	async handleHHCallback(code: string): Promise<{ success: boolean; error?: string }> {
		try {
			const res = await fetch(
				`${API_URL}/api/auth/hh/callback?code=${encodeURIComponent(code)}`,
				{
					credentials: 'include'
				}
			)

			if (res.ok) {
				await this.checkAuth()
				return { success: true }
			} else {
				const error = await res.json()
				return { success: false, error: error.message || 'HH.ru authentication failed' }
			}
		} catch (error) {
			return { success: false, error: 'Network error' }
		}
	}

	/**
	 * Get HH.ru OAuth URL
	 */
	async getHHAuthUrl(): Promise<string | null> {
		try {
			const res = await fetch(`${API_URL}/api/auth/hh/login`, {
				credentials: 'include'
			})

			if (res.ok) {
				const data = await res.json()
				return data.authUrl
			}
			return null
		} catch (error) {
			console.error('Failed to get HH.ru auth URL:', error)
			return null
		}
	}

	/**
	 * Check HH.ru connection status
	 */
	async checkHHStatus(): Promise<boolean> {
		try {
			const res = await fetch(`${API_URL}/api/auth/hh/status`, {
				credentials: 'include'
			})

			if (res.ok) {
				const data = await res.json()
				// Update user with HH connection status
				this.state.update((s) => ({
					...s,
					user: s.user ? { ...s.user, hhConnected: data.connected } : null
				}))
				return data.connected
			}
			return false
		} catch (error) {
			console.error('Failed to check HH.ru status:', error)
			return false
		}
	}

	/**
	 * Clean up
	 */
	destroy() {
		if (this.checkInterval !== null) {
			clearInterval(this.checkInterval)
		}
	}
}

export const auth = new AuthStore()

// Export derived stores for convenient access
export const isAuthenticated = auth.isAuthenticated
export const currentUser = auth.user
export const isLoadingAuth = auth.isLoading
