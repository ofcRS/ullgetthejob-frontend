<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import '../app.css'
  import StepIndicator from '$lib/components/StepIndicator.svelte'
  import { page } from '$app/stores'
  import GlobalSettings from '$lib/components/GlobalSettings.svelte'
  import FeedbackToast from '$lib/components/FeedbackToast.svelte'
  import NotificationCenter from '$lib/components/NotificationCenter.svelte'
  import ToastContainer from '$lib/components/ToastContainer.svelte'
  import { connectWebSocket, disconnectWebSocket, websocketStore } from '$lib/stores/websocket.store'
  import { updateProgress } from '$lib/stores/feedback.store'
  import { setupWebSocketNotifications } from '$lib/utils/websocketNotifications'
  import { getWebSocketClient } from '$lib/stores/ws.store'
  import type { ProgressUpdate } from '$lib/types'

  const USER_ID = 'test_user' // TODO: Replace with actual user ID from auth

  $: currentStep = (() => {
    const p = $page.url.pathname
    if (p.startsWith('/upload')) return 1
    if (p.startsWith('/search')) return 2
    if (p.startsWith('/jobs')) return 3
    if (p.startsWith('/application')) return 4
    return 1
  })()

  onMount(() => {
    // Connect WebSocket for real-time updates
    connectWebSocket(USER_ID)

    // Setup notification handlers for WebSocket events
    const wsClient = getWebSocketClient()
    if (wsClient) {
      setupWebSocketNotifications(wsClient)
    }

    // Subscribe to WebSocket messages for progress updates
    const unsubscribe = websocketStore.subscribe((message) => {
      if (!message) return

      // Handle cv_progress events
      if (message.type === 'cv_progress') {
        const progress: ProgressUpdate = {
          taskId: message.jobId || message.cvId || 'cv-task',
          taskType: 'cv_customize',
          progress: message.progress || 0,
          status: message.status === 'completed' ? 'completed' : message.status === 'error' ? 'failed' : 'in_progress',
          message: message.message || 'Customizing CV...',
          details: message
        }
        updateProgress(progress)
      }

      // Handle application_progress events
      if (message.type === 'application_progress') {
        const progress: ProgressUpdate = {
          taskId: message.applicationId || 'app-task',
          taskType: 'application_submit',
          progress: message.progress || 0,
          status: message.status === 'submitted' ? 'completed' : message.status === 'failed' ? 'failed' : 'in_progress',
          message: message.message || 'Submitting application...',
          details: message
        }
        updateProgress(progress)
      }

      // Handle batch processing events
      if (message.type === 'batch_progress') {
        const progress: ProgressUpdate = {
          taskId: message.workflowId || 'batch-task',
          taskType: 'batch_process',
          progress: message.progress || 0,
          status: message.status === 'completed' ? 'completed' : message.status === 'failed' ? 'failed' : 'in_progress',
          message: message.message || 'Processing batch...',
          details: message
        }
        updateProgress(progress)
      }
    })

    return () => {
      unsubscribe()
    }
  })

  onDestroy(() => {
    disconnectWebSocket()
  })
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <!-- Header with Notification Center -->
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
    <div class="container mx-auto px-4 py-3 max-w-screen-2xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a href="/" class="text-xl font-bold text-blue-600">UllGetTheJob</a>
          <nav class="hidden md:flex items-center gap-4 text-sm">
            <a href="/upload" class="hover:text-blue-600 transition-colors">Upload CV</a>
            <a href="/search" class="hover:text-blue-600 transition-colors">Search Jobs</a>
            <a href="/queue" class="hover:text-blue-600 transition-colors">Queue</a>
            <a href="/applications" class="hover:text-blue-600 transition-colors">Applications</a>
            <a href="/dashboard" class="hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="/analytics" class="hover:text-blue-600 transition-colors">Analytics</a>
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <a href="/settings/notifications" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Settings">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
          <NotificationCenter />
        </div>
      </div>
    </div>
  </header>

  <div class="container mx-auto px-4 py-6 max-w-screen-2xl">
    <StepIndicator {currentStep} />
    <slot />
  </div>
  <GlobalSettings />
  <FeedbackToast />
  <ToastContainer />
</div>