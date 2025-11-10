<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import '../app.css'
  import StepIndicator from '$lib/components/StepIndicator.svelte'
  import { page } from '$app/stores'
  import GlobalSettings from '$lib/components/GlobalSettings.svelte'
  import FeedbackToast from '$lib/components/FeedbackToast.svelte'
  import { connectWebSocket, disconnectWebSocket, websocketStore } from '$lib/stores/websocket.store'
  import { updateProgress } from '$lib/stores/feedback.store'
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
  <div class="container mx-auto px-4 py-6 max-w-screen-2xl">
    <StepIndicator {currentStep} />
    <slot />
  </div>
  <GlobalSettings />
  <FeedbackToast />
  </div>