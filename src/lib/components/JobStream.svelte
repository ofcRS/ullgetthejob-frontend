<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { websocket } from '$lib/stores/websocket.svelte'

  let selectedCVId: string | null = null
  let applicationStatus: Record<string, string> = {}

  onMount(() => {
    // Connect to WebSocket if not already connected
    if (!websocket.connected) {
      websocket.connect(import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws')
    }
  })

  onDestroy(() => {
    // WebSocket cleanup is handled by the store
  })

  async function applyToJob(job: any) {
    if (!selectedCVId) {
      alert('Please select a CV first')
      return
    }

    try {
      // Customize CV for this specific job
      const customizedCV = await api.post('/custom-cvs', {
        cvId: selectedCVId,
        jobId: job.id,
        jobTitle: job.title,
        jobDescription: job.description,
        company: job.company
      })

      // Quick apply - enqueue the application
      const application = await api.post('/applications', {
        jobId: job.id,
        customCvId: customizedCV.id,
        jobExternalId: job.id,
        coverLetter: customizedCV.coverLetter || ''
      })

      applicationStatus[job.id] = 'applied'
      console.log('Application queued:', application)
    } catch (error) {
      console.error('Failed to apply to job:', error)
      alert('Failed to apply to job. Please try again.')
    }
  }

  function formatSalary(salary: string | undefined): string {
    if (!salary) return 'Not specified'
    return salary
  }

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  function isTestRequired(job: any): boolean {
    return job.has_test && job.test_required
  }
</script>

<div class="job-stream">
  <div class="stream-header">
    <h2>Live Job Feed</h2>
    <div class="status-bar">
      <span class="connection-status" class:connected={websocket.connected}>
        {websocket.connected ? '● Live' : '○ Disconnected'}
      </span>
      <span class="job-count">
        {websocket.jobs.length} new jobs
      </span>
    </div>
  </div>

  {#if websocket.jobs.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No jobs yet</h3>
      <p>Start a job search to see live updates here</p>
    </div>
  {:else}
    <div class="job-list">
      {#each websocket.jobs as job (job.id)}
        <div class="job-card" animate:flip={{ duration: 300 }}>
          <div class="job-header">
            <h3>{job.title}</h3>
            <div class="company-badge">{job.company}</div>
          </div>

          <div class="job-details">
            <p class="salary">
              <span class="label">Salary:</span>
              {formatSalary(job.salary)}
            </p>
            <p class="location">
              <span class="label">Location:</span>
              {job.area}
            </p>
            {#if job.description}
              <p class="description">
                {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
              </p>
            {/if}
          </div>

          {#if job.skills && job.skills.length > 0}
            <div class="skills">
              {#each job.skills.slice(0, 5) as skill}
                <span class="skill-tag">{skill}</span>
              {/each}
              {#if job.skills.length > 5}
                <span class="skill-tag more">+{job.skills.length - 5} more</span>
              {/if}
            </div>
          {/if}

          {#if isTestRequired(job)}
            <div class="warning">
              ⚠️ Requires test assignment (cannot auto-apply)
            </div>
          {/if}

          <div class="actions">
            {#if applicationStatus[job.id] === 'applied'}
              <button class="applied-button" disabled>
                ✓ Applied
              </button>
            {:else if isTestRequired(job)}
              <button class="disabled-button" disabled>
                Cannot Auto-Apply
              </button>
            {:else}
              <button
                class="apply-button"
                on:click={() => applyToJob(job)}
                disabled={!selectedCVId}
              >
                Quick Apply
              </button>
            {/if}

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              class="view-link"
            >
              View on HH.ru
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="cv-selector">
    <label for="cv-select">Select CV for Quick Apply:</label>
    <select id="cv-select" bind:value={selectedCVId}>
      <option value="">Choose your CV...</option>
      <!-- This would be populated from API -->
      <option value="cv1">Software Developer CV</option>
      <option value="cv2">Full Stack Developer CV</option>
    </select>
  </div>
</div>

<style>
  .job-stream {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .stream-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stream-header h2 {
    margin: 0;
    color: #333;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .connection-status {
    color: #666;
  }

  .connection-status.connected {
    color: #28a745;
  }

  .job-count {
    background: #f8f9fa;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    color: #495057;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1.5rem;
    color: #6c757d;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .job-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .job-card {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
  }

  .job-card:hover {
    background: #f8f9fa;
  }

  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .job-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .company-badge {
    background: #007bff;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .job-details {
    margin-bottom: 1rem;
  }

  .job-details p {
    margin: 0.5rem 0;
    color: #495057;
    font-size: 0.9rem;
  }

  .label {
    font-weight: 500;
    color: #333;
  }

  .description {
    color: #6c757d;
    line-height: 1.4;
  }

  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .skill-tag {
    background: #e9ecef;
    color: #495057;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    font-size: 0.75rem;
  }

  .skill-tag.more {
    background: #ffc107;
    color: #212529;
  }

  .warning {
    background: #fff3cd;
    color: #856404;
    padding: 0.75rem;
    border-radius: 4px;
    border-left: 4px solid #ffc107;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .apply-button,
  .applied-button,
  .disabled-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .apply-button {
    background: #28a745;
    color: white;
  }

  .apply-button:hover:not(:disabled) {
    background: #218838;
  }

  .apply-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .applied-button {
    background: #28a745;
    color: white;
  }

  .disabled-button {
    background: #6c757d;
    color: white;
    cursor: not-allowed;
  }

  .view-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .view-link:hover {
    text-decoration: underline;
  }

  .cv-selector {
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .cv-selector label {
    font-weight: 500;
    color: #333;
    margin: 0;
  }

  .cv-selector select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .job-header {
      flex-direction: column;
      gap: 0.5rem;
    }

    .actions {
      flex-direction: column;
      align-items: stretch;
    }

    .cv-selector {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
  }
</style>
