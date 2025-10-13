<script lang="ts">
    import { onMount } from 'svelte'
  
    interface ParsedCV {
      email?: string
      phone?: string
      fullText: string
      experience?: string
      education?: string
      skills?: string[]
      projects?: string
    }
  
    interface CustomizedCV {
      email?: string
      phone?: string
      experience?: string
      education?: string
      skills?: string[]
      projects?: string
      firstName?: string
      lastName?: string
      title?: string
    }
  
    interface Job {
      id: string
      externalId: string
      title: string
      company: string
      salary: string
      area: string
      description: string
      requirements: string[]
      url: string
    }
  
    let uploadedCV: ParsedCV | null = null
    let customizedCV: CustomizedCV | null = null
    let coverLetter: string = ''
    let demoJob: Job | null = null
    let isGenerating = false
    let isSubmitting = false
    let error = ''
    let success = ''
    let fileInput: HTMLInputElement
  
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
    onMount(async () => {
      // Load demo job
      try {
        const res = await fetch(`${API_URL}/api/jobs/demo`)
        if (res.ok) {
          demoJob = await res.json()
        }
      } catch (err) {
        console.error('Failed to load demo job:', err)
      }
    })
  
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
          success = 'CV uploaded and parsed successfully!'
          // Reset customization
          customizedCV = null
          coverLetter = ''
        } else {
          error = data.error || 'Upload failed'
        }
      } catch (err) {
        error = 'Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error')
      }
    }
  
    async function generateCustomCV() {
      if (!uploadedCV || !demoJob) return
  
      isGenerating = true
      error = ''
      success = ''
  
      try {
        const res = await fetch(`${API_URL}/api/cv/customize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cv: uploadedCV,
            jobDescription: demoJob.description
          })
        })
  
        const data = await res.json()
  
        if (data.success) {
          customizedCV = data.customizedCV
          coverLetter = data.coverLetter
          success = 'CV and cover letter generated successfully!'
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
      if (!customizedCV || !coverLetter || !demoJob) return
  
      isSubmitting = true
      error = ''
      success = ''
  
      try {
        const res = await fetch(`${API_URL}/api/application/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobExternalId: demoJob.externalId,
            customizedCV,
            coverLetter
          })
        })
  
        const data = await res.json()
  
        if (data.success) {
          success = '🎉 Application submitted successfully to HH.ru!'
          // Reset for next application
          setTimeout(() => {
            uploadedCV = null
            customizedCV = null
            coverLetter = ''
            if (fileInput) fileInput.value = ''
          }, 3000)
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
    <title>UllGetTheJob - MVP</title>
  </svelte:head>
  
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          🎯 UllGetTheJob MVP
        </h1>
        <p class="text-lg text-gray-600">
          AI-powered job application assistant
        </p>
      </div>
  
      <!-- Status Messages -->
      {#if error}
        <div class="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p class="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      {/if}
  
      {#if success}
        <div class="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p class="font-semibold">Success</p>
          <p>{success}</p>
        </div>
      {/if}
  
      <!-- Step 1: Upload CV -->
      <div class="card mb-8 bg-white">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-900">
            Step 1: Upload Your CV
          </h2>
          {#if uploadedCV}
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Uploaded
            </span>
          {/if}
        </div>
        
        <input
          bind:this={fileInput}
          type="file"
          accept=".pdf,.doc,.docx"
          on:change={handleFileUpload}
          class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        <p class="mt-2 text-sm text-gray-500">
          Supported formats: PDF, DOC, DOCX (max 10MB)
        </p>
      </div>
  
      {#if uploadedCV && demoJob}
        <!-- Step 2: Three Column Layout -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            Step 2: Review & Customize
          </h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Column 1: Original CV -->
            <div class="card bg-white">
              <h3 class="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">
                📄 Your Original CV
              </h3>
              <div class="space-y-3 text-sm">
                {#if uploadedCV.email}
                  <div>
                    <span class="font-medium text-gray-700">Email:</span>
                    <p class="text-gray-600">{uploadedCV.email}</p>
                  </div>
                {/if}
                
                {#if uploadedCV.phone}
                  <div>
                    <span class="font-medium text-gray-700">Phone:</span>
                    <p class="text-gray-600">{uploadedCV.phone}</p>
                  </div>
                {/if}
                
                {#if uploadedCV.skills && uploadedCV.skills.length > 0}
                  <div>
                    <span class="font-medium text-gray-700">Skills:</span>
                    <div class="flex flex-wrap gap-2 mt-2">
                      {#each uploadedCV.skills.slice(0, 8) as skill}
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      {/each}
                      {#if uploadedCV.skills.length > 8}
                        <span class="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                          +{uploadedCV.skills.length - 8} more
                        </span>
                      {/if}
                    </div>
                  </div>
                {/if}
                
                {#if uploadedCV.experience}
                  <div>
                    <span class="font-medium text-gray-700">Experience:</span>
                    <p class="text-gray-600 text-xs mt-1 line-clamp-4">
                      {uploadedCV.experience}
                    </p>
                  </div>
                {/if}
              </div>
            </div>
  
            <!-- Column 2: Job Requirements -->
            <div class="card bg-blue-50">
              <h3 class="text-lg font-semibold mb-3 text-blue-900 border-b border-blue-200 pb-2">
                💼 {demoJob.title}
              </h3>
              <div class="space-y-3 text-sm">
                <div>
                  <span class="font-medium text-blue-900">Company:</span>
                  <p class="text-blue-800">{demoJob.company}</p>
                </div>
                
                <div>
                  <span class="font-medium text-blue-900">Location:</span>
                  <p class="text-blue-800">{demoJob.area}</p>
                </div>
                
                {#if demoJob.salary}
                  <div>
                    <span class="font-medium text-blue-900">Salary:</span>
                    <p class="text-blue-800">{demoJob.salary}</p>
                  </div>
                {/if}
                
                <div>
                  <span class="font-medium text-blue-900">Key Requirements:</span>
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#each demoJob.requirements as req}
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {req}
                      </span>
                    {/each}
                  </div>
                </div>
                
                <div>
                  <span class="font-medium text-blue-900">Description:</span>
                  <p class="text-blue-800 text-xs mt-1 whitespace-pre-wrap line-clamp-6">
                    {demoJob.description}
                  </p>
                </div>
              </div>
            </div>
  
            <!-- Column 3: Customized CV -->
            <div class="card {customizedCV ? 'bg-green-50' : 'bg-gray-50'}">
              <h3 class="text-lg font-semibold mb-3 {customizedCV ? 'text-green-900' : 'text-gray-700'} border-b {customizedCV ? 'border-green-200' : 'border-gray-200'} pb-2">
                ✨ Customized CV
              </h3>
              
              {#if customizedCV}
                <div class="space-y-3 text-sm">
                  {#if customizedCV.firstName || customizedCV.lastName}
                    <div>
                      <span class="font-medium text-green-900">Name:</span>
                      <p class="text-green-800">
                        {customizedCV.firstName || ''} {customizedCV.lastName || ''}
                      </p>
                    </div>
                  {/if}
                  
                  {#if customizedCV.email}
                    <div>
                      <span class="font-medium text-green-900">Email:</span>
                      <p class="text-green-800">{customizedCV.email}</p>
                    </div>
                  {/if}
                  
                  {#if customizedCV.title}
                    <div>
                      <span class="font-medium text-green-900">Title:</span>
                      <p class="text-green-800">{customizedCV.title}</p>
                    </div>
                  {/if}
                  
                  {#if customizedCV.skills && customizedCV.skills.length > 0}
                    <div>
                      <span class="font-medium text-green-900">Matched Skills:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each customizedCV.skills as skill}
                          <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {skill}
                          </span>
                        {/each}
                      </div>
                    </div>
                  {/if}
                  
                  {#if customizedCV.experience}
                    <div>
                      <span class="font-medium text-green-900">Relevant Experience:</span>
                      <p class="text-green-800 text-xs mt-1 line-clamp-4">
                        {customizedCV.experience}
                      </p>
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="flex flex-col items-center justify-center py-12 text-center">
                  <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <p class="text-gray-600 font-medium mb-2">Not generated yet</p>
                  <p class="text-gray-500 text-sm">
                    Click "Generate" below to create a customized CV
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
  
        <!-- Step 3: Cover Letter -->
        {#if coverLetter}
          <div class="mb-8">
            <div class="card bg-white">
              <h3 class="text-lg font-semibold mb-3 text-gray-900 border-b pb-2">
                📝 Generated Cover Letter
              </h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {coverLetter}
                </p>
              </div>
            </div>
          </div>
        {/if}
  
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on:click={generateCustomCV}
            disabled={isGenerating}
            class="btn btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if isGenerating}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            {:else}
              🤖 Generate CV & Cover Letter
            {/if}
          </button>
  
          {#if customizedCV && coverLetter}
            <button
              on:click={submitApplication}
              disabled={isSubmitting}
              class="px-8 py-3 text-lg font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              {:else}
                🚀 Submit Application to HH.ru
              {/if}
            </button>
          {/if}
        </div>
      {/if}
  
      {#if !uploadedCV}
        <div class="text-center py-12">
          <p class="text-gray-500 text-lg">
            👆 Upload your CV to get started
          </p>
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .line-clamp-4 {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .line-clamp-6 {
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>