import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses DOMPurify with strict configuration
 */
export function sanitizeHtml(html: string): string {
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'b',
			'i',
			'em',
			'strong',
			'u',
			'p',
			'br',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'span',
			'div',
			'a'
		],
		ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
		ALLOW_DATA_ATTR: false,
		ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
	})
}

/**
 * Sanitize text with basic HTML (paragraphs and line breaks only)
 */
export function sanitizeText(text: string): string {
	// First escape HTML
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')

	// Then allow line breaks
	return escaped.replace(/\n/g, '<br>')
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(html: string): string {
	return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize CV data fields
 */
export function sanitizeCVField(value: unknown): string {
	if (value == null) return ''
	if (typeof value === 'string') return sanitizeText(value)
	if (Array.isArray(value)) {
		return value
			.map((entry) => sanitizeCVField(entry))
			.filter((entry) => entry.trim().length > 0)
			.join('<br><br>')
	}
	if (typeof value === 'object') {
		const parts = Object.values(value as Record<string, unknown>)
			.map((entry) => sanitizeCVField(entry))
			.filter((entry) => entry.trim().length > 0)
		return parts.join(', ')
	}
	return sanitizeText(String(value))
}
