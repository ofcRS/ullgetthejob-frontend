# Notification System Documentation

## Overview

The notification system provides real-time alerts and updates throughout the application. It includes:

- **In-App Toast Notifications** - Temporary pop-ups for quick feedback
- **Browser Notifications** - System-level notifications that work even when tab is inactive
- **Notification Center** - Persistent notification history accessible via bell icon
- **WebSocket Integration** - Automatic notifications for background events
- **User Preferences** - Granular control over notification types

---

## Features

### 1. **In-App Toast Notifications**

Toast notifications appear in the top-right corner and auto-dismiss after 5 seconds (configurable).

**Types:**
- ✅ **Success** (green) - Positive actions completed
- ❌ **Error** (red) - Errors and failures (doesn't auto-close)
- ⚠️ **Warning** (amber) - Warnings and alerts
- ℹ️ **Info** (blue) - General information

**Features:**
- Auto-close with animated progress bar
- Action buttons for quick navigation
- Priority-based display (urgent notifications stay)
- Accessible (ARIA live regions)

### 2. **Browser Notifications**

System-level notifications using Web Notifications API.

**Features:**
- Work when tab is inactive or browser is minimized
- Require user permission
- Priority-based (urgent notifications require interaction)
- Auto-dismiss for low priority notifications
- Sound alerts for important notifications

### 3. **Notification Center**

Persistent notification history accessible via bell icon in header.

**Features:**
- Unread count badge
- Priority indicators (urgent/high = colored bar)
- Read/unread status
- Sortable by priority and time
- Action buttons within notifications
- Clear all / clear read functionality
- Mobile-responsive dropdown

### 4. **WebSocket Integration**

Automatic notifications for background events:

**Events Monitored:**
- 🎉 **Interview Requests** (urgent) - Company wants to interview you
- ✅ **Application Submitted** - Application successfully submitted
- ✨ **Customization Complete** - CV customization finished
- ⚠️ **Rate Limit Warning** - Approaching daily limit
- 🚫 **Rate Limit Reached** - Daily limit hit
- ❌ **Errors** - Any failures during processing
- 📤 **Job Queued** - Jobs added to queue

---

## Usage

### Basic Usage

```typescript
import { showSuccess, showError, showWarning, showInfo } from '$lib/stores/notifications.store'

// Simple success notification
showSuccess('CV Uploaded', 'Your CV was uploaded successfully')

// Error notification (doesn't auto-close)
showError('Upload Failed', 'Failed to upload CV. Please try again.')

// Warning with custom duration
showWarning('Rate Limit', 'Only 5 applications remaining', { duration: 10000 })

// Info notification
showInfo('Processing', 'Your request is being processed')
```

### Advanced Usage with Actions

```typescript
import { addNotification } from '$lib/stores/notifications.store'
import { goto } from '$app/navigation'

// Notification with action button
addNotification('Applications Ready', 'Your CVs are ready to submit', {
  type: 'success',
  priority: 'high',
  action: {
    label: 'Start Auto-Apply',
    onClick: () => goto('/queue')
  }
})

// Urgent notification that doesn't auto-close
addNotification('Interview Request!', 'Company X wants to interview you', {
  type: 'success',
  priority: 'urgent',
  icon: '🎉',
  autoClose: false,
  action: {
    label: 'View Details',
    onClick: () => goto('/applications')
  }
})
```

### Using Notification Manager

```typescript
import { notificationManager } from '$lib/utils/notificationManager'

// Request browser notification permission
const granted = await notificationManager.requestPermission()

// Show specialized notifications
notificationManager.notifyApplicationSubmitted('Software Engineer', true)
notificationManager.notifyInterviewRequest('Frontend Dev', 'Acme Corp')
notificationManager.notifyRateLimitWarning(5, 20)
notificationManager.notifyCvUploadComplete(true, 'my-cv.pdf')

// Check notification support
if (notificationManager.isSupported()) {
  // Browser supports notifications
}

// Check if enabled
if (notificationManager.isEnabled()) {
  // Browser notifications are enabled
}
```

### WebSocket Integration

The system automatically listens to WebSocket events and shows notifications. No manual setup required in components!

```typescript
// WebSocket events are automatically handled by setupWebSocketNotifications()
// Called in +layout.svelte on app mount

// Custom WebSocket handler (if needed)
import { getWebSocketClient } from '$lib/stores/ws.store'
import { showSuccess } from '$lib/stores/notifications.store'

const wsClient = getWebSocketClient()
if (wsClient) {
  wsClient.on('custom_event', (message) => {
    showSuccess('Custom Event', message.data.message)
  })
}
```

---

## User Preferences

Users can configure notifications at `/settings/notifications`:

**Global Settings:**
- Enable/disable all notifications
- Enable browser notifications (requires permission)
- Enable toast notifications
- Enable notification sounds

**Event-Specific Settings:**
- 🎉 Interview Requests
- 📤 Application Submitted
- ✨ Customization Complete
- ⚠️ Rate Limit Warnings
- ✅ Success Messages
- ❌ Error Messages
- ⚠️ Warning Messages

**Preferences are stored in localStorage** and persist across sessions.

---

## Architecture

### File Structure

```
src/lib/
├── stores/
│   └── notifications.store.ts          # State management
├── components/
│   ├── Toast.svelte                    # Individual toast notification
│   ├── ToastContainer.svelte           # Toast stack container
│   └── NotificationCenter.svelte       # Bell icon + dropdown
└── utils/
    ├── notificationManager.ts          # High-level notification API
    ├── websocketNotifications.ts       # WebSocket event handlers
    └── clickOutside.ts                 # Click outside utility

src/routes/
├── +layout.svelte                      # Global layout with notification system
└── settings/
    └── notifications/
        └── +page.svelte                # Notification preferences page
```

### State Management

**Stores:**
- `notifications` - Array of all notifications
- `notificationPreferences` - User preferences (synced to localStorage)
- `unreadCount` - Derived count of unread notifications
- `sortedNotifications` - Derived notifications sorted by priority/time

**Functions:**
- `addNotification()` - Add notification with full options
- `showSuccess()` - Quick success notification
- `showError()` - Quick error notification
- `showWarning()` - Quick warning notification
- `showInfo()` - Quick info notification
- `showUrgent()` - Urgent notification (doesn't auto-close)
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `removeNotification()` - Remove single notification
- `clearAllNotifications()` - Clear all
- `clearReadNotifications()` - Clear read only

### Notification Priority System

Priorities determine display behavior:

1. **Urgent** (red indicator)
   - Doesn't auto-close
   - Requires user interaction
   - Plays sound
   - Shows browser notification even if tab active

2. **High** (orange indicator)
   - Doesn't auto-close for errors
   - Plays sound
   - Browser notification

3. **Normal** (no indicator)
   - Auto-closes after 5 seconds
   - Standard behavior

4. **Low** (no indicator)
   - Auto-closes after 3 seconds
   - Subtle appearance

---

## Best Practices

### When to Show Notifications

**✅ DO show notifications for:**
- Completed background tasks (CV customization, application submission)
- Important updates (interview requests, rate limits)
- Errors that require user attention
- Success confirmations for major actions

**❌ DON'T show notifications for:**
- Every button click or navigation
- Validation errors (use inline form errors instead)
- Expected behavior (e.g., loading states)
- Too frequently (causes notification fatigue)

### Notification Content

**Title:** Short and action-oriented
- ✅ "CV Uploaded Successfully"
- ❌ "Success"

**Message:** Clear and informative
- ✅ "Your application to Software Engineer at Acme Corp was submitted"
- ❌ "Done"

**Action Button:** Clear call-to-action
- ✅ "View Application"
- ❌ "Click Here"

### Priority Guidelines

```typescript
// Urgent - Critical user attention needed
notificationManager.notifyInterviewRequest(...)

// High - Important but not critical
showError('Application Failed', ...)

// Normal - Standard updates
showSuccess('CV Uploaded', ...)

// Low - Informational only
showInfo('Processing started', ...)
```

---

## Accessibility

The notification system is built with accessibility in mind:

- **ARIA live regions** - Screen readers announce notifications
- **Keyboard navigation** - Tab through notification center
- **Focus management** - Proper focus on actions
- **Color contrast** - WCAG AA compliant
- **Screen reader labels** - Descriptive aria-labels
- **Priority indication** - Visual and semantic

---

## Browser Compatibility

**Web Notifications API Support:**
- ✅ Chrome/Edge 22+
- ✅ Firefox 22+
- ✅ Safari 7+
- ✅ Opera 25+
- ❌ Internet Explorer (not supported)

**Graceful Degradation:**
- If browser notifications not supported, falls back to toast notifications only
- All features work without browser notifications enabled

---

## Troubleshooting

### Browser Notifications Not Working

1. **Check permission status:**
   ```typescript
   console.log(notificationManager.getPermission()) // 'granted', 'denied', or 'default'
   ```

2. **Request permission:**
   - Go to `/settings/notifications`
   - Click "Enable Browser Notifications"
   - Allow permission in browser prompt

3. **Check if blocked:**
   - If blocked, user must manually enable in browser settings
   - Chrome: Site Settings → Notifications → Allow
   - Firefox: Site Permissions → Notifications → Allow

### Notifications Not Showing

1. **Check preferences:**
   ```typescript
   import { notificationPreferences } from '$lib/stores/notifications.store'
   console.log($notificationPreferences)
   ```

2. **Check if disabled:**
   - Go to `/settings/notifications`
   - Ensure "Enable Notifications" is ON
   - Check specific event types are enabled

3. **Check WebSocket connection:**
   ```typescript
   import { wsStatus } from '$lib/stores/ws.store'
   console.log($wsStatus) // Should be 'connected'
   ```

### Too Many Notifications

Users can:
- Disable specific notification types in settings
- Disable toast notifications (keep browser notifications only)
- Disable all notifications
- Clear notification center regularly

---

## Testing

### Manual Testing

1. **Test toast notifications:**
   - Go to `/settings/notifications`
   - Click "Send Test Notification"
   - Should see toast in top-right corner

2. **Test browser notifications:**
   - Enable browser notifications in settings
   - Upload a CV
   - Should receive browser notification when complete

3. **Test notification center:**
   - Generate some notifications
   - Click bell icon in header
   - Should see notification list
   - Click notification to mark as read
   - Check unread count updates

4. **Test WebSocket notifications:**
   - Add jobs to queue
   - Run batch customization
   - Should receive real-time notifications

### Automated Testing

```typescript
// Example test with Vitest + Testing Library
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { showSuccess } from '$lib/stores/notifications.store'

describe('Notification System', () => {
  it('should show success notification', () => {
    showSuccess('Test', 'This is a test')
    // Assert notification appears
  })

  it('should auto-close after duration', async () => {
    showSuccess('Test', 'Auto-close test', { duration: 1000 })
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1100))
    // Assert notification removed
  })
})
```

---

## Future Enhancements

Potential improvements for future releases:

1. **Notification Grouping** - Group similar notifications
2. **Email Notifications** - Send important notifications via email
3. **SMS Notifications** - Critical alerts via SMS
4. **Push Notifications** - Service Worker based push
5. **Notification History** - Persistent storage in database
6. **Notification Scheduling** - Schedule notifications for later
7. **Smart Bundling** - Combine multiple notifications into digest
8. **Rich Notifications** - Images, progress bars, multiple actions
9. **Notification Templates** - Reusable notification templates
10. **Analytics** - Track notification engagement

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review browser console for errors
- Check notification preferences at `/settings/notifications`
- Test with "Send Test Notification" button

---

**Version:** 1.0.0
**Last Updated:** 2025-11-10
