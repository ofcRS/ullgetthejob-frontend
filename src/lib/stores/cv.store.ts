import { writable } from 'svelte/store'
import type { ParsedCV, CustomizedCV } from '$lib/types'

export const uploadedCv = writable<ParsedCV | null>(null)
export const customizedCv = writable<CustomizedCV | null>(null)
export const coverLetter = writable<string>('')
export const selectedModel = writable<string>('anthropic/claude-3.5-sonnet')


