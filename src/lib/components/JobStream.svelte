<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { websocket } from '$lib/stores/websocket.svelte'
  import { api } from '$lib/api/client'
  
  const dispatch = createEventDispatcher()
  
  let connected = false
  let jobs: any[] = []
  let applicationStatus: Record<string, string> = {}
  let selectedCVId = ''
  let error = ''
  
  // Props
  export let filters = {}
  export let autoApply = false
  
  // Local store bindings
  const connectedStore = websocket.connected
  const jobsStore = websocket.jobs
  
  $: connected = $connectedStore as boolean
  $: jobs = $jobsStore as any[]
  
  // Subscribe to new filters
  $: if (filters && Object.keys(filters as Record<string, unknown>).length > 0) {
    websocket.subscribe(filters as Record<string, unknown>)
  }
  
  async function applyToJob(job: any) {
    if (!selectedCVId) {
      error = 'Please select a CV first'
      return
    }
    
    try {
      // First, customize CV
      const customCV: any = await api.post('/custom-cvs', {
        cvId: selectedCVId,
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description
      })
      
      // Then submit application
      const application: any = await api.post('/applications', {
        jobId: job.id,
        customCvId: customCV.id,
        jobExternalId: job.id,
        coverLetter: customCV.coverLetter
      })
      applicationStatus[job.id] = 'applied'
      applicationStatus = { ...applicationStatus } // Trigger reactivity
      
      dispatch('applied', { job, application })
    } catch (err) {
      console.error('Application error:', err)
      error = err instanceof Error ? err.message : 'Failed to apply'
      applicationStatus[job.id] = 'failed'
      applicationStatus = { ...applicationStatus }
    }
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
</script>

<div class="job-stream">
  <!-- Status Bar -->
  <div class="status-bar">
    <div class="status-left">
      <span class="connection-status" class:connected>
        {#if connected}
          <span class="dot bg-green-500"></span> Live
        {:else}
          <span class="dot bg-red-500"></span> Disconnected
        {/if}
      </span>
      <span class="job-count">
        {jobs.length} jobs
      </span>
    </div>
  </div>
  
  {#if error}
    <div class="error-banner">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span>{error}</span>
      <button on:click={() => error = ''} class="ml-auto">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  {/if}
  
  <!-- Job List -->
  <div class="job-list">
    {#if jobs.length === 0}
      <div class="empty-state">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8"></path>
        </svg>
        <p class="text-gray-600 text-lg">No jobs yet</p>
        <p class="text-gray-500 text-sm mt-2">New jobs will appear here automatically</p>
      </div>
    {:else}
      {#each jobs as job (job.id)}
        <div class="job-card">
          <div class="job-header">
            <h3 class="job-title">{job.title}</h3>
            {#if job.has_test && job.test_required}
              <span class="test-badge">Test Required</span>
            {/if}
          </div>
          
          <p class="company">{job.company || 'Company not specified'}</p>
          
          <div class="job-details">
            {#if job.salary}
              <div class="detail-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{job.salary}</span>
              </div>
            {/if}
            {#if job.area}
              <div class="detail-item">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{job.area}</span>
              </div>
            {/if}
          </div>
          
          {#if job.skills && job.skills.length > 0}
            <div class="skills">
              {#each job.skills.slice(0, 5) as skill}
                <span class="skill-tag">{skill}</span>
              {/each}
              {#if job.skills.length > 5}
                <span class="skill-tag-more">+{job.skills.length - 5} more</span>
              {/if}
            </div>
          {/if}
          
          {#if job.has_test && job.test_required}
            <div class="warning">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>This job requires a test assignment (cannot auto-apply)</span>
            </div>
          {/if}
          
          <div class="actions">
            {#if applicationStatus[job.id] === 'applied'}
              <button class="btn-applied" disabled>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Applied
              </button>
            {:else if applicationStatus[job.id] === 'failed'}
              <button class="btn-failed" on:click={() => applyToJob(job)}>
                Retry
              </button>
            {:else if job.has_test && job.test_required}
              <a href={job.url} target="_blank" rel="noopener noreferrer" class="btn-secondary">
                View on HH.ru
              </a>
            {:else}
              <button class="btn-primary" on:click={() => applyToJob(job)}>
                Quick Apply
              </button>
              <a href={job.url} target="_blank" rel="noopener noreferrer" class="btn-secondary">
                View Details
              </a>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .job-stream {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .status-bar {
    background-color: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .connection-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #6b7280;
  }
  
  .connection-status.connected {
    color: #059669;
  }
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .job-count {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .error-banner {
    background-color: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #991b1b;
  }
  
  .job-list {
    display: grid;
    gap: 1.5rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .job-card {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }
  
  .job-card:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
  
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .job-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .test-badge {
    background-color: #fef3c7;
    color: #92400e;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
  }
  
  .company {
    color: #6b7280;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .job-details {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4b5563;
    font-size: 0.875rem;
  }
  
  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .skill-tag {
    background-color: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .skill-tag-more {
    background-color: #f3f4f6;
    color: #6b7280;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
  }
  
  .warning {
    background-color: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #92400e;
    font-size: 0.875rem;
  }
  
  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
  }
  
  .btn-secondary {
    background-color: white;
    color: #3b82f6;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    border: 1px solid #3b82f6;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
  }
  
  .btn-secondary:hover {
    background-color: #eff6ff;
  }
  
  .btn-applied {
    background-color: #10b981;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: not-allowed;
    opacity: 0.8;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-failed {
    background-color: #ef4444;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .btn-failed:hover {
    background-color: #dc2626;
  }
</style>
