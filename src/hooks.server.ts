import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Authentication hook - verifies user session via backend
 */
const authenticationHandle: Handle = async ({ event, resolve }) => {
	// Get cookies from request
	const cookies = event.request.headers.get('cookie')

	if (cookies) {
		try {
			// Verify session with backend API
			const response = await fetch(`${API_URL}/api/auth/status`, {
				headers: {
					cookie: cookies
				}
			})

			if (response.ok) {
				const data = await response.json()
				if (data.user) {
					event.locals.user = data.user
				}
			}
		} catch (error) {
			console.error('[Auth Hook] Failed to verify session:', error)
			// Continue without user - let route protection handle it
		}
	}

	return resolve(event)
}

/**
 * Security headers hook
 */
const securityHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)

	// Add security headers
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte in dev
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self' data:",
			`connect-src 'self' ${API_URL} ws://localhost:3000 wss://localhost:3000 ws: wss:`,
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self' https://hh.ru"
		].join('; ')
	)

	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

	// HSTS for production
	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
	}

	return response
}

/**
 * CORS handling hook (if needed for API calls)
 */
const corsHandle: Handle = async ({ event, resolve }) => {
	// Handle preflight requests
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Origin': '*', // Configure based on your needs
				'Access-Control-Allow-Headers': 'Content-Type, Authorization'
			}
		})
	}

	return resolve(event)
}

/**
 * Error handling hook
 */
const errorHandle: Handle = async ({ event, resolve }) => {
	try {
		return await resolve(event)
	} catch (error) {
		console.error('[Error Hook] Unhandled error:', error)

		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
	}
}

// Combine all hooks in sequence
export const handle = sequence(authenticationHandle, securityHandle, corsHandle, errorHandle)
