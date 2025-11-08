import { writable } from 'svelte/store'
import type { RateLimitStatus } from '$lib/types'

export const rateLimitStatus = writable<RateLimitStatus | null>(null)
