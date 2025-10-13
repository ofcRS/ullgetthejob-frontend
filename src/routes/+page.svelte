<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  interface ParsedCV {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    title?: string
    summary?: string
    experience?: string
    education?: string
    skills?: string[]
    projects?: string
    fullText: string
  }

  interface Job {
    id: string
    hh_vacancy_id?: string
    title: string
    company: string
    salary?: string
    area?: string
    description: string
    url?: string
    skills?: string[]
    has_test?: boolean
  }

  interface Model {
    id: string
    name: string
    provider: string
    description: string
  }

  let uploadedCV: ParsedCV | null = null
  let customizedCV: any = null
  let coverLetter: string = ''
  let jobs: Job[] = []
  let selectedJob: Job | null = null
  let isGenerating = false
  let isSubmitting = false
  let isSearching = false
  let error = ''
  let success = ''
  let fileInput: HTMLInputElement
  
  // Model selection
  let availableModels: Model[] = []
  let selectedModel = 'anthropic/claude-3.5-sonnet'
  
  // Job search
  let searchQuery = ''
  let searchArea = '1' // Moscow
  
  // WebSocket
  let ws: WebSocket | null = null

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const WS_URL = API_URL.replace('http', 'ws') + '/ws'

  onMount(async () => {
    // Load available models
    try {
      const res = await fetch(`${API_URL}/api/models`)
      if (res.ok) {
        const data = await res.json()
        availableModels = data.models
      }
    } catch (err) {
      console.error('Failed to load models:', err)
    }

    // Connect WebSocket
    connectWebSocket()
  })

  onDestroy(() => {
    if (ws) {
      ws.close()
    }
  })

  function connectWebSocket() {
    try {
      ws = new WebSocket(WS_URL)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'new_jobs' && Array.isArray(data.jobs)) {
            console.log('Received new jobs:', data.jobs.length)
            jobs = [...data.jobs, ...jobs].slice(0, 50) // Keep latest 50
          }
        } catch (err) {
          console.error('WebSocket message error:', err)
        }
      }
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
      }
      
      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setTimeout(connectWebSocket, 5000)
      }
    } catch (err) {
      console.error('WebSocket connection failed:', err)
    }
  }

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement
    if (!input.files?.[0]) return

    const file = input.files[0]
    const formData = new FormData()
    formData.append('file', file)

    error = ''
    success = ''

    try {
      const res = await fetch(`${API_URL}/api/cv/upload`, {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (data.success) {
        uploadedCV = data.cv
        success = 'CV uploaded and parsed successfully with AI!'
        customizedCV = null
        coverLetter = ''
      } else {
        error = data.error || 'Upload failed'
      }
    } catch (err) {
      error = 'Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')
    }
  }

  async function searchJobs() {
    if (!searchQuery.trim()) {
      error = 'Please enter a search query'
      return
    }

    isSearching = true
    error = ''
    jobs = []

    try {
      const res = await fetch(`${API_URL}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: searchQuery,
          area: searchArea,
          schedule: 'remote'
        })
      })

      const data = await res.json()

      if (data.success) {
        jobs = data.jobs
        success = `Found ${jobs.length} jobs!`
        
        // Subscribe to real-time updates via WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            searchParams: { text: searchQuery, area: searchArea }
          }))
        }
      } else {
        error = data.error || 'Job search failed'
      }
    } catch (err) {
      error = 'Search failed: ' + (err instanceof Error ? err.message : 'Unknown error')
    } finally {
      isSearching = false
    }
  }

  function selectJob(job: Job) {
    selectedJob = job
    customizedCV = null
    coverLetter = ''
    success = ''
  }

  async function generateCustomCV() {
    if (!uploadedCV || !selectedJob) return

    isGenerating = true
    error = ''
    success = ''

    try {
      const res = await fetch(`${API_URL}/api/cv/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv: uploadedCV,
          jobDescription: selectedJob.description,
          model: selectedModel
        })
      })

      const data = await res.json()

      if (data.success) {
        customizedCV = data.customizedCV
        coverLetter = data.coverLetter
        success = `Generated with ${data.modelUsed}!`
      } else {
        error = data.error || 'Generation failed'
      }
    } catch (err) {
      error = 'Generation failed: ' + (err instanceof Error ? err.message : 'Unknown error')
    } finally {
      isGenerating = false
    }
  }

  async function submitApplication() {
    if (!customizedCV || !coverLetter || !selectedJob) return

    isSubmitting = true
    error = ''
    success = ''

    try {
      const res = await fetch(`${API_URL}/api/application/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobExternalId: selectedJob.hh_vacancy_id || selectedJob.id,
          customizedCV,
          coverLetter
        })
      })

      const data = await res.json()

      if (data.success) {
        success = '🎉 Application submitted successfully to HH.ru!'
      } else {
        error = data.error || 'Submission failed'
      }
    } catch (err) {
      error = 'Submission failed: ' + (err instanceof Error ? err.message : 'Unknown error')
    } finally {
      isSubmitting = false
    }
  }
</script>

<svelte:head>
  <title>UllGetTheJob - Enhanced MVP</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">
        🎯 UllGetTheJob Enhanced
      </h1>
      <p class="text-lg text-gray-600">
        AI-powered job application assistant with real-time job updates
      </p>
    </div>

    <!-- Status Messages -->
    {#if error}
      <div class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p class="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    {/if}

    {#if success}
      <div class="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
        <p class="font-semibold">Success</p>
        <p>{success}</p>
      </div>
    {/if}

    <!-- Step 1: Upload CV -->
    <div class="card mb-6 bg-white">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">
        Step 1: Upload Your CV
        {#if uploadedCV}
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-3">
            ✓ Uploaded
          </span>
        {/if}
      </h2>
      
      <input
        bind:this={fileInput}
        type="file"
        accept=".pdf,.doc,.docx"
        on:change={handleFileUpload}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />
      <p class="mt-2 text-sm text-gray-500">
        Supported: PDF, DOC, DOCX • Parsed with AI for best results
      </p>
    </div>

    <!-- Step 2: Search Jobs -->
    <div class="card mb-6 bg-white">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">
        Step 2: Search Jobs on HH.ru
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="e.g. JavaScript Developer, Python Engineer..."
            class="input w-full"
            on:keydown={(e) => e.key === 'Enter' && searchJobs()}
          />
        </div>
        
        <select bind:value={searchArea} class="input">
          <option value="1">Moscow</option>
          <option value="2">Saint Petersburg</option>
          <option value="113">Russia</option>
        </select>
      </div>
      
      <button
        on:click={searchJobs}
        disabled={isSearching || !searchQuery.trim()}
        class="btn btn-primary mt-4"
      >
        {isSearching ? 'Searching...' : '🔍 Search Jobs'}
      </button>
      
      {#if jobs.length > 0}
        <p class="mt-4 text-sm text-gray-600">
          Found {jobs.length} jobs • Updates in real-time via WebSocket
        </p>
      {/if}
    </div>

    <!-- Job List -->
    {#if jobs.length > 0}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {#each jobs as job}
          <button
            on:click={() => selectJob(job)}
            class="card text-left transition-all {selectedJob?.id === job.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:shadow-lg'}"
          >
            <h3 class="font-semibold text-lg text-gray-900 mb-2">
              {job.title}
              {#if job.has_test}
                <span class="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Test Required</span>
              {/if}
            </h3>
            <p class="text-gray-700 mb-2">{job.company}</p>
            <div class="flex flex-wrap gap-2 text-sm text-gray-600">
              {#if job.salary}
                <span>💰 {job.salary}</span>
              {/if}
              {#if job.area}
                <span>📍 {job.area}</span>
              {/if}
            </div>
            {#if job.skills && job.skills.length > 0}
              <div class="flex flex-wrap gap-2 mt-3">
                {#each job.skills.slice(0, 5) as skill}
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{skill}</span>
                {/each}
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Step 3: Generate & Apply -->
    {#if uploadedCV && selectedJob}
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Step 3: Customize & Apply
        </h2>
        
        <!-- Model Selector -->
        <div class="card bg-white mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            AI Model Selection
          </label>
          <select bind:value={selectedModel} class="input w-full md:w-1/2">
            {#each availableModels as model}
              <option value={model.id}>
                {model.name} ({model.provider}) - {model.description}
              </option>
            {/each}
          </select>
          <p class="mt-2 text-sm text-gray-500">
            Different models may produce different results. Claude 3.5 Sonnet recommended for best quality.
          </p>
        </div>
        
        <!-- Three Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Original CV -->
          <div class="card bg-white">
            <h3 class="font-semibold mb-3 border-b pb-2">📄 Your CV</h3>
            <div class="space-y-2 text-sm">
              {#if uploadedCV.firstName || uploadedCV.lastName}
                <p><strong>Name:</strong> {uploadedCV.firstName} {uploadedCV.lastName}</p>
              {/if}
              {#if uploadedCV.email}
                <p><strong>Email:</strong> {uploadedCV.email}</p>
              {/if}
              {#if uploadedCV.title}
                <p><strong>Title:</strong> {uploadedCV.title}</p>
              {/if}
              {#if uploadedCV.skills && uploadedCV.skills.length > 0}
                <div>
                  <strong>Skills:</strong>
                  <div class="flex flex-wrap gap-1 mt-1">
                    {#each uploadedCV.skills.slice(0, 6) as skill}
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{skill}</span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Job Requirements -->
          <div class="card bg-blue-50">
            <h3 class="font-semibold mb-3 border-b border-blue-200 pb-2">💼 {selectedJob.title}</h3>
            <div class="space-y-2 text-sm">
              <p><strong>Company:</strong> {selectedJob.company}</p>
              {#if selectedJob.salary}
                <p><strong>Salary:</strong> {selectedJob.salary}</p>
              {/if}
              {#if selectedJob.area}
                <p><strong>Location:</strong> {selectedJob.area}</p>
              {/if}
              <div>
                <strong>Description:</strong>
                <p class="text-xs mt-1 line-clamp-6">{selectedJob.description}</p>
              </div>
            </div>
          </div>

          <!-- Customized CV -->
          <div class="card {customizedCV ? 'bg-green-50' : 'bg-gray-50'}">
            <h3 class="font-semibold mb-3 border-b pb-2">✨ Customized CV</h3>
            {#if customizedCV}
              <div class="space-y-2 text-sm">
                {#if customizedCV.firstName || customizedCV.lastName}
                  <p><strong>Name:</strong> {customizedCV.firstName} {customizedCV.lastName}</p>
                {/if}
                {#if customizedCV.title}
                  <p><strong>Title:</strong> {customizedCV.title}</p>
                {/if}
                {#if customizedCV.summary}
                  <p><strong>Summary:</strong> {customizedCV.summary}</p>
                {/if}
                {#if customizedCV.skills && customizedCV.skills.length > 0}
                  <div>
                    <strong>Skills:</strong>
                    <div class="flex flex-wrap gap-1 mt-1">
                      {#each customizedCV.skills as skill}
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{skill}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="text-center py-8">
                <p class="text-gray-500">Not generated yet</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Cover Letter -->
        {#if coverLetter}
          <div class="card bg-white mb-6">
            <h3 class="font-semibold mb-3 border-b pb-2">📝 Cover Letter</h3>
            <div class="bg-gray-50 p-4 rounded">
              <p class="text-sm whitespace-pre-wrap">{coverLetter}</p>
            </div>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button
            on:click={generateCustomCV}
            disabled={isGenerating}
            class="btn btn-primary"
          >
            {isGenerating ? 'Generating...' : '🤖 Generate with ' + availableModels.find(m => m.id === selectedModel)?.name}
          </button>

          {#if customizedCV && coverLetter}
            <button
              on:click={submitApplication}
              disabled={isSubmitting}
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : '🚀 Submit to HH.ru'}
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-6 {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>