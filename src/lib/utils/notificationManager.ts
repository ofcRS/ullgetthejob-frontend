import { get } from 'svelte/store'
import { goto } from '$app/navigation'
import {
	addNotification,
	showSuccess,
	showError,
	showWarning,
	showInfo,
	showUrgent,
	notificationPreferences,
	type NotificationPriority
} from '$lib/stores/notifications.store'

export class NotificationManager {
	private static instance: NotificationManager
	private permission: NotificationPermission = 'default'
	private audioContext: AudioContext | null = null
	private notificationSound: AudioBuffer | null = null

	private constructor() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			this.permission = Notification.permission
			this.initAudio()
		}
	}

	static getInstance(): NotificationManager {
		if (!this.instance) {
			this.instance = new NotificationManager()
		}
		return this.instance
	}

	/**
	 * Initialize audio context for notification sounds
	 */
	private async initAudio() {
		try {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

			// Create a simple notification sound using Web Audio API
			const duration = 0.2
			const sampleRate = this.audioContext.sampleRate
			const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
			const data = buffer.getChannelData(0)

			// Generate a simple beep sound
			for (let i = 0; i < buffer.length; i++) {
				const t = i / sampleRate
				data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-3 * t) * 0.3
			}

			this.notificationSound = buffer
		} catch (error) {
			console.warn('Failed to initialize audio context:', error)
		}
	}

	/**
	 * Play notification sound
	 */
	private playSound() {
		const prefs = get(notificationPreferences)
		if (!prefs.soundEnabled || !this.audioContext || !this.notificationSound) return

		try {
			const source = this.audioContext.createBufferSource()
			source.buffer = this.notificationSound
			source.connect(this.audioContext.destination)
			source.start(0)
		} catch (error) {
			console.warn('Failed to play notification sound:', error)
		}
	}

	/**
	 * Request browser notification permission
	 */
	async requestPermission(): Promise<boolean> {
		if (!('Notification' in window)) {
			console.warn('This browser does not support notifications')
			return false
		}

		if (this.permission === 'granted') {
			return true
		}

		try {
			const permission = await Notification.requestPermission()
			this.permission = permission

			if (permission === 'granted') {
				// Update preferences
				notificationPreferences.update((prefs) => ({
					...prefs,
					browserNotifications: true
				}))
				return true
			}

			return false
		} catch (error) {
			console.error('Failed to request notification permission:', error)
			return false
		}
	}

	/**
	 * Show browser notification
	 */
	private showBrowserNotification(
		title: string,
		options: NotificationOptions & { priority?: NotificationPriority }
	) {
		const prefs = get(notificationPreferences)

		if (
			!prefs.browserNotifications ||
			this.permission !== 'granted' ||
			!('Notification' in window)
		) {
			return null
		}

		try {
			const notification = new Notification(title, {
				icon: '/favicon.png',
				badge: '/favicon.png',
				...options,
				requireInteraction: options.priority === 'urgent' || options.priority === 'high'
			})

			// Play sound for important notifications
			if (options.priority === 'urgent' || options.priority === 'high') {
				this.playSound()
			}

			return notification
		} catch (error) {
			console.error('Failed to show browser notification:', error)
			return null
		}
	}

	/**
	 * Notify application submitted
	 */
	notifyApplicationSubmitted(jobTitle: string, success: boolean) {
		const prefs = get(notificationPreferences)
		if (!prefs.notifyOnApplicationSubmitted) return

		if (success) {
			showSuccess('Application Submitted', `Your application to ${jobTitle} was submitted successfully`, {
				action: {
					label: 'View Applications',
					onClick: () => goto('/applications')
				}
			})

			this.showBrowserNotification('Application Submitted', {
				body: `Successfully applied to ${jobTitle}`,
				tag: 'application-submitted',
				priority: 'normal'
			})
		} else {
			showError(
				'Application Failed',
				`Failed to submit application to ${jobTitle}. Please try again.`,
				{
					action: {
						label: 'View Queue',
						onClick: () => goto('/queue')
					}
				}
			)
		}
	}

	/**
	 * Notify customization complete
	 */
	notifyCustomizationComplete(jobCount: number) {
		const prefs = get(notificationPreferences)
		if (!prefs.notifyOnCustomizationComplete) return

		const message =
			jobCount === 1
				? 'Your CV has been customized and is ready to apply'
				: `${jobCount} CVs have been customized and are ready to apply`

		showSuccess('Customization Complete', message, {
			action: {
				label: 'Start Auto-Apply',
				onClick: () => goto('/queue')
			}
		})

		this.showBrowserNotification('Customization Complete', {
			body: message,
			tag: 'customization-complete',
			priority: 'normal'
		})
	}

	/**
	 * Notify interview request (urgent)
	 */
	notifyInterviewRequest(jobTitle: string, company: string) {
		const prefs = get(notificationPreferences)
		if (!prefs.notifyOnInterviewRequest) return

		showUrgent('🎉 Interview Request!', `${company} wants to interview you for ${jobTitle}`, {
			action: {
				label: 'View Details',
				onClick: () => goto('/applications')
			}
		})

		this.showBrowserNotification('🎉 Interview Request!', {
			body: `${company} wants to interview you for ${jobTitle}`,
			tag: 'interview-request',
			priority: 'urgent',
			requireInteraction: true
		})

		// Play sound for urgent notifications
		this.playSound()
	}

	/**
	 * Notify application response
	 */
	notifyApplicationResponse(
		jobTitle: string,
		responseType: 'positive' | 'negative' | 'neutral'
	) {
		if (responseType === 'positive') {
			this.notifyInterviewRequest(jobTitle, 'Company')
		} else if (responseType === 'negative') {
			showInfo('Application Update', `Response received for ${jobTitle}`, {
				action: {
					label: 'View Details',
					onClick: () => goto('/applications')
				}
			})
		}
	}

	/**
	 * Notify rate limit warning
	 */
	notifyRateLimitWarning(tokensRemaining: number, capacity: number) {
		const prefs = get(notificationPreferences)
		if (!prefs.notifyOnRateLimit) return

		if (tokensRemaining <= 5) {
			showWarning(
				'⚠️ Rate Limit Warning',
				`Only ${tokensRemaining} of ${capacity} applications remaining today`,
				{
					autoClose: false,
					action: {
						label: 'View Status',
						onClick: () => goto('/queue')
					}
				}
			)
		}

		if (tokensRemaining === 0) {
			showError('Rate Limit Reached', 'Daily application limit reached. Applications will resume tomorrow.', {
				autoClose: false
			})

			this.showBrowserNotification('Rate Limit Reached', {
				body: 'Daily application limit reached',
				tag: 'rate-limit',
				priority: 'high'
			})
		}
	}

	/**
	 * Notify CV upload complete
	 */
	notifyCvUploadComplete(success: boolean, filename?: string) {
		if (success) {
			showSuccess('CV Uploaded', `${filename || 'Your CV'} was uploaded and parsed successfully`, {
				action: {
					label: 'Search Jobs',
					onClick: () => goto('/search')
				}
			})
		} else {
			showError('Upload Failed', 'Failed to upload CV. Please try again.')
		}
	}

	/**
	 * Notify error
	 */
	notifyError(title: string, message: string) {
		showError(title, message)
	}

	/**
	 * Notify success
	 */
	notifySuccess(title: string, message: string, options?: { action?: { label: string; onClick: () => void } }) {
		showSuccess(title, message, options)
	}

	/**
	 * Notify warning
	 */
	notifyWarning(title: string, message: string, options?: { action?: { label: string; onClick: () => void } }) {
		showWarning(title, message, options)
	}

	/**
	 * Notify info
	 */
	notifyInfo(title: string, message: string, options?: { action?: { label: string; onClick: () => void } }) {
		showInfo(title, message, options)
	}

	/**
	 * Check if browser notifications are supported
	 */
	isSupported(): boolean {
		return typeof window !== 'undefined' && 'Notification' in window
	}

	/**
	 * Get current permission status
	 */
	getPermission(): NotificationPermission {
		return this.permission
	}

	/**
	 * Check if browser notifications are enabled
	 */
	isEnabled(): boolean {
		const prefs = get(notificationPreferences)
		return prefs.browserNotifications && this.permission === 'granted'
	}
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()
