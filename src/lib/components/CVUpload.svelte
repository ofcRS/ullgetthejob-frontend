<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()
  
  let files: FileList | null = null
  let uploading = false
  let error = ''
  let parsedCV: any = null
  let dragover = false
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  async function handleUpload() {
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      error = 'Please upload a PDF, DOC, or DOCX file'
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error = 'File size must be less than 10MB'
      return
    }
    
    uploading = true
    error = ''
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${API_URL}/cvs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }
      
      const result = await response.json()
      parsedCV = result
      
      dispatch('uploaded', { cv: result })
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      console.error('Upload error:', err)
    } finally {
      uploading = false
    }
  }
  
  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    files = target.files
    if (files && files.length > 0) {
      handleUpload()
    }
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragover = false
    files = event.dataTransfer?.files || null
    if (files && files.length > 0) {
      handleUpload()
    }
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    dragover = true
  }
  
  function handleDragLeave() {
    dragover = false
  }
</script>

<div class="upload-container">
  <label 
    class="upload-area" 
    class:dragover
    on:drop={handleDrop}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
  >
    <input 
      type="file" 
      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      on:change={handleFileChange}
      disabled={uploading}
      class="hidden"
    />
    
    {#if uploading}
      <div class="loading">
        <div class="spinner"></div>
        <p class="mt-4 text-gray-700">Processing your CV...</p>
        <p class="text-sm text-gray-500">This may take a moment</p>
      </div>
    {:else if error}
      <div class="error">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-red-600 font-medium">{error}</p>
        <button 
          on:click={() => { error = ''; parsedCV = null; files = null }}
          class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    {:else if parsedCV}
      <div class="success">
        <svg class="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-green-700 font-semibold text-lg mb-4">✓ CV uploaded successfully!</p>
        
        <div class="cv-preview">
          {#if parsedCV.parsedData}
            <div class="preview-item">
              <span class="preview-label">Name:</span>
              <span class="preview-value">{parsedCV.name || 'N/A'}</span>
            </div>
            {#if parsedCV.parsedData.email}
              <div class="preview-item">
                <span class="preview-label">Email:</span>
                <span class="preview-value">{parsedCV.parsedData.email}</span>
              </div>
            {/if}
            {#if parsedCV.parsedData.phone}
              <div class="preview-item">
                <span class="preview-label">Phone:</span>
                <span class="preview-value">{parsedCV.parsedData.phone}</span>
              </div>
            {/if}
            {#if parsedCV.parsedData.skills && parsedCV.parsedData.skills.length > 0}
              <div class="preview-item">
                <span class="preview-label">Skills:</span>
                <div class="skills-tags">
                  {#each parsedCV.parsedData.skills.slice(0, 5) as skill}
                    <span class="skill-tag">{skill}</span>
                  {/each}
                  {#if parsedCV.parsedData.skills.length > 5}
                    <span class="skill-tag">+{parsedCV.parsedData.skills.length - 5} more</span>
                  {/if}
                </div>
              </div>
            {/if}
          {/if}
        </div>
        
        <button 
          on:click={() => { parsedCV = null; files = null }}
          class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Upload another CV
        </button>
      </div>
    {:else}
      <div class="placeholder">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="text-lg font-medium text-gray-700 mb-2">Drop your CV here or click to browse</p>
        <p class="text-sm text-gray-500">PDF, DOC, DOCX supported (max 10MB)</p>
      </div>
    {/if}
  </label>
</div>

<style>
  .upload-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .upload-area {
    display: block;
    width: 100%;
    min-height: 300px;
    padding: 2rem;
    border: 3px dashed #d1d5db;
    border-radius: 12px;
    background-color: #f9fafb;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .upload-area:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
  
  .upload-area.dragover {
    border-color: #3b82f6;
    background-color: #dbeafe;
    transform: scale(1.02);
  }
  
  .hidden {
    display: none;
  }
  
  .loading, .error, .success, .placeholder {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 250px;
  }
  
  .spinner {
    border: 4px solid #f3f4f6;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .cv-preview {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: left;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    max-width: 400px;
    margin: 0 auto;
  }
  
  .preview-item {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .preview-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .preview-value {
    font-size: 1rem;
    color: #1f2937;
  }
  
  .skills-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .skill-tag {
    background-color: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
