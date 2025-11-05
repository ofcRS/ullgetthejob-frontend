import { get } from 'svelte/store'
import { goto } from '$app/navigation'
import { auth } from './store'

/**
 * Route guard for authenticated routes
 * Call this in onMount() of protected pages
 */
export async function requireAuth(): Promise<boolean> {
	const isAuthenticated = await auth.checkAuth()

	if (!isAuthenticated) {
		goto('/login')
		return false
	}

	return true
}

/**
 * Route guard for guest-only routes (login, register)
 * Redirects to home if already authenticated
 */
export async function requireGuest(): Promise<boolean> {
	const isAuthenticated = await auth.checkAuth()

	if (isAuthenticated) {
		goto('/')
		return false
	}

	return true
}

/**
 * Check if HH.ru is connected
 */
export async function requireHHConnection(): Promise<boolean> {
	const connected = await auth.checkHHStatus()

	if (!connected) {
		goto('/connect-hh')
		return false
	}

	return true
}
