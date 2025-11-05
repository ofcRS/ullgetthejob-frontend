import { z } from 'zod'

/**
 * Validation schemas for forms
 */

// CV Upload Schema
export const cvUploadSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.size <= 10_000_000, 'File size must be less than 10MB')
		.refine(
			(file) =>
				[
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				].includes(file.type),
			'File must be PDF, DOC, or DOCX'
		)
})

// Job Search Schema
export const jobSearchSchema = z.object({
	text: z
		.string()
		.min(2, 'Search query must be at least 2 characters')
		.max(200, 'Search query must be less than 200 characters')
		.refine((text) => {
			// XSS prevention - check for suspicious patterns
			const suspiciousPatterns = /<script|javascript:|onerror=|onclick=|onload=/i
			return !suspiciousPatterns.test(text)
		}, 'Search query contains invalid characters'),
	area: z.string().optional(),
	experience: z.string().optional(),
	employment: z.string().optional(),
	schedule: z.string().optional()
})

// CV Customization Schema
export const cvCustomizationSchema = z.object({
	jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
	model: z.string().optional()
})

// Application Submission Schema
export const applicationSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.refine((name) => name.trim().length > 0, 'Name cannot be empty'),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Invalid email address')
		.max(255, 'Email must be less than 255 characters'),
	phone: z
		.string()
		.optional()
		.refine((phone) => {
			if (!phone) return true
			// Basic phone validation (international format)
			const phoneRegex = /^\+?[\d\s\-()]+$/
			return phoneRegex.test(phone)
		}, 'Invalid phone number format'),
	coverLetter: z
		.string()
		.min(50, 'Cover letter must be at least 50 characters')
		.max(5000, 'Cover letter must be less than 5000 characters')
})

// Login Schema
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
})

// Register Schema
export const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password must be less than 100 characters')
		.refine((password) => {
			// Password strength: at least one uppercase, one lowercase, one number
			return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)
		}, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
	confirmPassword: z.string(),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.optional()
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

/**
 * Validate file magic bytes to ensure file type matches content
 */
export async function validateFileMagicBytes(file: File): Promise<{
	valid: boolean
	error?: string
}> {
	try {
		// Read first 8 bytes for magic byte detection
		const buffer = await file.slice(0, 8).arrayBuffer()
		const bytes = new Uint8Array(buffer)

		// Check magic bytes for common file types
		const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 // %PDF
		const isDOC = bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0 // DOC magic
		const isDOCX =
			bytes[0] === 0x50 &&
			bytes[1] === 0x4b &&
			bytes[2] === 0x03 &&
			bytes[3] === 0x04 // ZIP (DOCX is a ZIP file)

		if (!isPDF && !isDOC && !isDOCX) {
			return {
				valid: false,
				error: 'File content does not match declared type. File may be corrupted or renamed.'
			}
		}

		return { valid: true }
	} catch (error) {
		return {
			valid: false,
			error: 'Failed to read file for validation'
		}
	}
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
	return input
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;')
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

/**
 * Validate email format (RFC 5322 compliant)
 */
export function isValidEmail(email: string): boolean {
	const emailRegex =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
	return emailRegex.test(email)
}

/**
 * Helper to get validation errors in a user-friendly format
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {}

	error.issues.forEach((err: z.ZodIssue) => {
		const path = err.path.join('.')
		errors[path] = err.message
	})

	return errors
}

/**
 * Helper to validate data against schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
	success: boolean
	data?: T
	errors?: Record<string, string>
} {
	try {
		const validData = schema.parse(data)
		return { success: true, data: validData }
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { success: false, errors: formatValidationErrors(error) }
		}
		return { success: false, errors: { _form: 'Validation failed' } }
	}
}
