<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { websocket } from '$lib/stores/websocket.svelte'
  import { api } from '$lib/api/client'

  const dispatch = createEventDispatcher()

  let searchParams = {
    text: '',
    area: '1', // Moscow
    experience: 'between1And3',
    employment: 'full',
    schedule: 'remote'
  }

  export let autoApply = false
  let maxApplications = 20
  let selectedCVId: string | null = null
  let isSearching = false

  function startSearch() {
    if (!searchParams.text.trim()) {
      alert('Please enter a job title or keywords')
      return
    }

    isSearching = true

    // Subscribe to job updates via WebSocket
    websocket.subscribe(searchParams)

    // If auto-apply is enabled, start workflow
    if (autoApply && selectedCVId) {
      handleAutoApply()
    } else {
      dispatch('searchStarted', { searchParams })
    }
  }

  async function handleAutoApply() {
    if (!selectedCVId) {
      alert('Please select a CV first')
      return
    }

    try {
      const result = await api.startWorkflow(selectedCVId, searchParams, maxApplications)

      dispatch('workflowStarted', {
        workflowId: result.workflowId,
        queued: result.queued,
        maxApplications
      })
    } catch (error) {
      console.error('Failed to start workflow:', error)
      alert('Failed to start auto-apply. Please try again.')
    }
  }

  function resetSearch() {
    searchParams = {
      text: '',
      area: '1',
      experience: 'between1And3',
      employment: 'full',
      schedule: 'remote'
    }
    autoApply = false
    maxApplications = 20
    isSearching = false
  }
</script>

<div class="search-panel">
  <div class="search-header">
    <h2>Find Your Next Job</h2>
    <p>Search for jobs on HH.ru and set up automated applications</p>
  </div>

  <div class="form-grid">
    <!-- Job Search Text -->
    <div class="form-group">
      <label for="search-text">Job Title or Keywords</label>
      <input
        id="search-text"
        type="text"
        bind:value={searchParams.text}
        placeholder="e.g. React Developer, Python Engineer"
        disabled={isSearching}
        required
      />
    </div>

    <!-- Location -->
    <div class="form-group">
      <label for="area">Location</label>
      <select id="area" bind:value={searchParams.area} disabled={isSearching}>
        <option value="1">Moscow</option>
        <option value="2">Saint Petersburg</option>
        <option value="3">Remote</option>
        <option value="88">Russia</option>
      </select>
    </div>

    <!-- Experience Level -->
    <div class="form-group">
      <label for="experience">Experience Level</label>
      <select id="experience" bind:value={searchParams.experience} disabled={isSearching}>
        <option value="noExperience">No experience</option>
        <option value="between1And3">1-3 years</option>
        <option value="between3And6">3-6 years</option>
        <option value="moreThan6">6+ years</option>
      </select>
    </div>

    <!-- Employment Type -->
    <div class="form-group">
      <label for="employment">Employment Type</label>
      <select id="employment" bind:value={searchParams.employment} disabled={isSearching}>
        <option value="full">Full-time</option>
        <option value="part">Part-time</option>
        <option value="project">Project work</option>
        <option value="probation">Probation</option>
      </select>
    </div>

    <!-- Work Schedule -->
    <div class="form-group">
      <label for="schedule">Work Schedule</label>
      <select id="schedule" bind:value={searchParams.schedule} disabled={isSearching}>
        <option value="remote">Remote</option>
        <option value="fullDay">Full day</option>
        <option value="shift">Shift work</option>
        <option value="flexible">Flexible schedule</option>
      </select>
    </div>

    <!-- CV Selection -->
    <div class="form-group">
      <label for="cv-select">Select CV</label>
      <select id="cv-select" bind:value={selectedCVId} disabled={isSearching} required>
        <option value="">Choose your CV...</option>
        <!-- This would be populated from API -->
        <option value="cv1">Software Developer CV</option>
        <option value="cv2">Full Stack Developer CV</option>
      </select>
    </div>

    <!-- Auto-Apply Toggle -->
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={autoApply} disabled={isSearching} />
        <span class="checkmark"></span>
        Enable Auto-Apply
      </label>
      <small>Automatically apply to matching jobs using AI-customized CVs</small>
    </div>

    <!-- Max Applications (only show if auto-apply is enabled) -->
    {#if autoApply}
      <div class="form-group">
        <label for="max-apps">Max Applications</label>
        <input
          id="max-apps"
          type="number"
          bind:value={maxApplications}
          min="1"
          max="50"
          disabled={isSearching}
        />
        <small>Maximum number of applications to submit (HH.ru limit: ~200/day)</small>
      </div>
    {/if}
  </div>

  <div class="button-group">
    <button
      class="primary-button"
      on:click={startSearch}
      disabled={!searchParams.text.trim() || isSearching}
    >
      {#if autoApply && selectedCVId}
        Start Auto-Apply
      {:else}
        Search Jobs
      {/if}
    </button>

    {#if isSearching}
      <button class="secondary-button" on:click={resetSearch}>
        Reset Search
      </button>
    {/if}
  </div>

  <div class="connection-status">
    <span class="status-indicator" class:connected={websocket.connected}>
      {websocket.connected ? '🟢' : '🔴'}
    </span>
    <span class="status-text">
      {websocket.connected ? 'Connected to live job updates' : 'Disconnected - will reconnect automatically'}
    </span>
  </div>
</div>

<style>
  .search-panel {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
  }

  .search-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .search-header h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .search-header p {
    margin: 0;
    color: #666;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input,
  .form-group select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #007bff;
  }

  .checkbox-group {
    align-items: flex-start;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
    margin-bottom: 0.5rem;
  }

  .checkbox-label input[type="checkbox"] {
    margin-right: 0.5rem;
    width: auto;
  }

  .checkmark {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-radius: 3px;
    margin-right: 0.5rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .checkbox-label input[type="checkbox"]:checked + .checkmark {
    background: #007bff;
    border-color: #007bff;
  }

  .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 2px;
    color: white;
    font-size: 12px;
  }

  small {
    color: #666;
    font-size: 0.875rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .primary-button,
  .secondary-button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .primary-button {
    background: #007bff;
    color: white;
  }

  .primary-button:hover:not(:disabled) {
    background: #0056b3;
  }

  .primary-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .secondary-button {
    background: #6c757d;
    color: white;
  }

  .secondary-button:hover {
    background: #545b62;
  }

  .connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .status-indicator {
    font-size: 1rem;
  }

  .status-text {
    color: #666;
  }

  .status-indicator.connected {
    color: #28a745;
  }

  @media (max-width: 768px) {
    .search-panel {
      padding: 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>
