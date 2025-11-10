import type { WebSocketClient } from '$lib/websocket/client'
import { notificationManager } from './notificationManager'
import { goto } from '$app/navigation'

/**
 * Setup notification handlers for WebSocket events
 */
export function setupWebSocketNotifications(wsClient: WebSocketClient) {
	// CV Upload Progress Complete
	wsClient.on('cv_complete', (message) => {
		notificationManager.notifyCvUploadComplete(
			message.data?.success !== false,
			message.data?.filename
		)
	})

	// CV Upload Error
	wsClient.on('cv_error', (message) => {
		notificationManager.notifyError(
			'CV Upload Failed',
			message.data?.error || 'An error occurred while processing your CV'
		)
	})

	// Customization Progress Complete
	wsClient.on('customization_progress', (message) => {
		const { status, completed, total } = message.data || {}

		if (status === 'completed') {
			notificationManager.notifyCustomizationComplete(completed || total || 1)
		}
	})

	// Customization Error
	wsClient.on('customization_error', (message) => {
		notificationManager.notifyError(
			'Customization Failed',
			message.data?.error || 'Failed to customize CV'
		)
	})

	// Application Submitted
	wsClient.on('application_submitted', (message) => {
		const { jobId, jobTitle, success, error } = message.data || {}

		notificationManager.notifyApplicationSubmitted(
			jobTitle || `Job ${jobId}`,
			success !== false
		)

		if (!success && error) {
			notificationManager.notifyError('Application Error', error)
		}
	})

	// Application Progress Complete
	wsClient.on('application_progress', (message) => {
		const { status, completed, total, failed } = message.data || {}

		if (status === 'completed') {
			const successCount = (completed || 0) - (failed || 0)
			if (successCount > 0) {
				notificationManager.notifySuccess(
					'Auto-Apply Complete',
					`Successfully submitted ${successCount} application${successCount === 1 ? '' : 's'}`,
					{
						action: {
							label: 'View Applications',
							onClick: () => goto('/applications')
						}
					}
				)
			}

			if (failed && failed > 0) {
				notificationManager.notifyWarning(
					'Some Applications Failed',
					`${failed} application${failed === 1 ? '' : 's'} could not be submitted`,
					{
						action: {
							label: 'View Queue',
							onClick: () => goto('/queue')
						}
					}
				)
			}
		}
	})

	// Application Response (Interview Request)
	wsClient.on('application_response', (message) => {
		const { jobTitle, company, responseType } = message.data || {}

		if (responseType === 'interview' || responseType === 'positive') {
			notificationManager.notifyInterviewRequest(
				jobTitle || 'Position',
				company || 'Company'
			)
		} else if (responseType === 'rejection' || responseType === 'negative') {
			notificationManager.notifyInfo(
				'Application Update',
				`Response received for ${jobTitle || 'your application'}`,
				{
					action: {
						label: 'View Details',
						onClick: () => goto('/applications')
					}
				}
			)
		}
	})

	// Rate Limit Update
	wsClient.on('rate_limit_update', (message) => {
		const { tokens, capacity } = message.data || {}

		if (typeof tokens === 'number' && typeof capacity === 'number') {
			notificationManager.notifyRateLimitWarning(tokens, capacity)
		}
	})

	// Rate Limit Reached
	wsClient.on('rate_limit_reached', (message) => {
		notificationManager.notifyError(
			'Rate Limit Reached',
			'Daily application limit reached. Applications will resume tomorrow.'
		)
	})

	// Generic Error
	wsClient.on('error', (message) => {
		const { error, title } = message.data || {}
		notificationManager.notifyError(title || 'Error', error || 'An error occurred')
	})

	// Job Added to Queue
	wsClient.on('job_queued', (message) => {
		const { jobTitle, count } = message.data || {}

		if (count && count > 1) {
			notificationManager.notifySuccess(
				'Jobs Added to Queue',
				`${count} jobs added to your queue`,
				{
					action: {
						label: 'View Queue',
						onClick: () => goto('/queue')
					}
				}
			)
		} else if (jobTitle) {
			notificationManager.notifySuccess('Job Added', `${jobTitle} added to your queue`)
		}
	})

	console.log('[Notifications] WebSocket notification handlers registered')
}

/**
 * Remove notification handlers
 */
export function cleanupWebSocketNotifications(wsClient: WebSocketClient) {
	// The WebSocket client should handle cleanup internally
	console.log('[Notifications] WebSocket notification handlers cleaned up')
}
