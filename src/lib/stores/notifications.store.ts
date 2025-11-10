import { writable, derived, get } from 'svelte/store'

export type NotificationType = 'info' | 'success' | 'error' | 'warning'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
	id: string
	title: string
	message: string
	type: NotificationType
	priority: NotificationPriority
	timestamp: number
	read: boolean
	icon?: string
	action?: {
		label: string
		onClick: () => void
	}
	autoClose?: boolean
	duration?: number
}

// Store for all notifications
export const notifications = writable<Notification[]>([])

// Store for notification preferences
export interface NotificationPreferences {
	enabled: boolean
	browserNotifications: boolean
	toastNotifications: boolean
	soundEnabled: boolean
	notifyOnSuccess: boolean
	notifyOnError: boolean
	notifyOnWarning: boolean
	notifyOnInterviewRequest: boolean
	notifyOnApplicationSubmitted: boolean
	notifyOnCustomizationComplete: boolean
	notifyOnRateLimit: boolean
}

const defaultPreferences: NotificationPreferences = {
	enabled: true,
	browserNotifications: false, // Requires permission
	toastNotifications: true,
	soundEnabled: false,
	notifyOnSuccess: true,
	notifyOnError: true,
	notifyOnWarning: true,
	notifyOnInterviewRequest: true,
	notifyOnApplicationSubmitted: true,
	notifyOnCustomizationComplete: true,
	notifyOnRateLimit: true
}

// Load preferences from localStorage
function loadPreferences(): NotificationPreferences {
	if (typeof window === 'undefined') return defaultPreferences

	try {
		const stored = localStorage.getItem('notification_preferences')
		if (stored) {
			return { ...defaultPreferences, ...JSON.parse(stored) }
		}
	} catch (error) {
		console.error('Failed to load notification preferences:', error)
	}

	return defaultPreferences
}

export const notificationPreferences = writable<NotificationPreferences>(loadPreferences())

// Save preferences to localStorage whenever they change
if (typeof window !== 'undefined') {
	notificationPreferences.subscribe((prefs) => {
		try {
			localStorage.setItem('notification_preferences', JSON.stringify(prefs))
		} catch (error) {
			console.error('Failed to save notification preferences:', error)
		}
	})
}

// Derived store for unread count
export const unreadCount = derived(notifications, ($notifications) =>
	$notifications.filter((n) => !n.read).length
)

// Derived store for notifications sorted by priority and timestamp
export const sortedNotifications = derived(notifications, ($notifications) => {
	const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
	return [...$notifications].sort((a, b) => {
		// First sort by priority
		const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
		if (priorityDiff !== 0) return priorityDiff
		// Then by timestamp (newest first)
		return b.timestamp - a.timestamp
	})
})

/**
 * Add a new notification
 */
export function addNotification(
	title: string,
	message: string,
	options: {
		type?: NotificationType
		priority?: NotificationPriority
		icon?: string
		action?: { label: string; onClick: () => void }
		autoClose?: boolean
		duration?: number
	} = {}
): string {
	const id = crypto.randomUUID()

	const notification: Notification = {
		id,
		title,
		message,
		type: options.type || 'info',
		priority: options.priority || 'normal',
		timestamp: Date.now(),
		read: false,
		icon: options.icon,
		action: options.action,
		autoClose: options.autoClose !== false,
		duration: options.duration || 5000
	}

	notifications.update((n) => [...n, notification])

	// Auto-remove notification after duration if autoClose is enabled
	if (notification.autoClose) {
		setTimeout(() => {
			removeNotification(id)
		}, notification.duration)
	}

	return id
}

/**
 * Show a success notification
 */
export function showSuccess(title: string, message: string, options = {}) {
	const prefs = get(notificationPreferences)
	if (!prefs.enabled || !prefs.notifyOnSuccess) return

	return addNotification(title, message, {
		type: 'success',
		priority: 'normal',
		icon: '✅',
		...options
	})
}

/**
 * Show an error notification
 */
export function showError(title: string, message: string, options = {}) {
	const prefs = get(notificationPreferences)
	if (!prefs.enabled || !prefs.notifyOnError) return

	return addNotification(title, message, {
		type: 'error',
		priority: 'high',
		icon: '❌',
		autoClose: false, // Errors should stay until dismissed
		...options
	})
}

/**
 * Show a warning notification
 */
export function showWarning(title: string, message: string, options = {}) {
	const prefs = get(notificationPreferences)
	if (!prefs.enabled || !prefs.notifyOnWarning) return

	return addNotification(title, message, {
		type: 'warning',
		priority: 'normal',
		icon: '⚠️',
		...options
	})
}

/**
 * Show an info notification
 */
export function showInfo(title: string, message: string, options = {}) {
	const prefs = get(notificationPreferences)
	if (!prefs.enabled) return

	return addNotification(title, message, {
		type: 'info',
		priority: 'low',
		icon: 'ℹ️',
		...options
	})
}

/**
 * Show an urgent notification (for interview requests, etc.)
 */
export function showUrgent(title: string, message: string, options = {}) {
	const prefs = get(notificationPreferences)
	if (!prefs.enabled) return

	return addNotification(title, message, {
		type: 'success',
		priority: 'urgent',
		icon: '🎉',
		autoClose: false, // Urgent notifications should stay
		...options
	})
}

/**
 * Mark notification as read
 */
export function markAsRead(id: string) {
	notifications.update((n) =>
		n.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
	)
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
	notifications.update((n) => n.map((notification) => ({ ...notification, read: true })))
}

/**
 * Remove a notification
 */
export function removeNotification(id: string) {
	notifications.update((n) => n.filter((notification) => notification.id !== id))
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
	notifications.set([])
}

/**
 * Clear read notifications
 */
export function clearReadNotifications() {
	notifications.update((n) => n.filter((notification) => !notification.read))
}
