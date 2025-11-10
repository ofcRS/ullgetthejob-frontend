import { writable, get } from 'svelte/store'
import type { FeedbackNotification, ProgressUpdate } from '$lib/types'

// Active notifications
export const notifications = writable<FeedbackNotification[]>([])

// Active progress updates
export const progressUpdates = writable<Map<string, ProgressUpdate>>(new Map())

// Notification functions
export function addNotification(
  notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
): string {
  const id = crypto.randomUUID()
  const fullNotification: FeedbackNotification = {
    id,
    timestamp: new Date().toISOString(),
    ...notification
  }

  notifications.update(notifs => [...notifs, fullNotification])

  // Auto-dismiss after duration if specified
  if (notification.duration && notification.duration > 0) {
    setTimeout(() => {
      dismissNotification(id)
    }, notification.duration)
  }

  return id
}

export function dismissNotification(id: string) {
  notifications.update(notifs => notifs.filter(n => n.id !== id))
}

export function clearAllNotifications() {
  notifications.set([])
}

// Convenience functions for common notification types
export function showSuccess(title: string, message: string, duration = 5000) {
  return addNotification({
    type: 'success',
    title,
    message,
    duration,
    dismissible: true
  })
}

export function showError(title: string, message: string, duration = 0) {
  return addNotification({
    type: 'error',
    title,
    message,
    duration,
    dismissible: true
  })
}

export function showWarning(title: string, message: string, duration = 7000) {
  return addNotification({
    type: 'warning',
    title,
    message,
    duration,
    dismissible: true
  })
}

export function showInfo(title: string, message: string, duration = 5000) {
  return addNotification({
    type: 'info',
    title,
    message,
    duration,
    dismissible: true
  })
}

export function showProgress(
  title: string,
  message: string,
  progress: number,
  taskId?: string
) {
  // Find existing progress notification for this task
  const existingNotifs = get(notifications)
  const existingNotif = existingNotifs.find(
    n => n.type === 'progress' && n.id === taskId
  )

  if (existingNotif) {
    // Update existing notification
    notifications.update(notifs =>
      notifs.map(n =>
        n.id === taskId
          ? { ...n, title, message, progress }
          : n
      )
    )
    return taskId || existingNotif.id
  } else {
    // Create new progress notification
    return addNotification({
      type: 'progress',
      title,
      message,
      progress,
      duration: 0,
      dismissible: false
    })
  }
}

// Progress update functions
export function updateProgress(update: ProgressUpdate) {
  progressUpdates.update(map => {
    map.set(update.taskId, update)
    return map
  })

  // Show notification for progress
  if (update.status === 'started') {
    showProgress(
      update.message,
      'Starting...',
      0,
      update.taskId
    )
  } else if (update.status === 'in_progress') {
    showProgress(
      update.message,
      `${update.progress}% complete`,
      update.progress,
      update.taskId
    )
  } else if (update.status === 'completed') {
    dismissNotification(update.taskId)
    showSuccess(update.message, 'Completed successfully!')
    progressUpdates.update(map => {
      map.delete(update.taskId)
      return map
    })
  } else if (update.status === 'failed') {
    dismissNotification(update.taskId)
    showError(update.message, 'Task failed')
    progressUpdates.update(map => {
      map.delete(update.taskId)
      return map
    })
  }
}

export function clearProgress(taskId: string) {
  progressUpdates.update(map => {
    map.delete(taskId)
    return map
  })
  dismissNotification(taskId)
}

export function clearAllProgress() {
  const updates = get(progressUpdates)
  updates.forEach((_, taskId) => {
    dismissNotification(taskId)
  })
  progressUpdates.set(new Map())
}
