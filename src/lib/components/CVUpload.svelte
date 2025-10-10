<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { api } from '$lib/api/client'

  const dispatch = createEventDispatcher()

  let files: FileList | null = null
  let uploading = false
  let parsedCV: any = null
  let error: string | null = null

  async function handleUpload() {
    if (!files?.[0]) return

    uploading = true
    error = null

    try {
      const result = await api.uploadCV(files[0])
      parsedCV = result.cv
      // Dispatch event for parent components
      dispatch('uploaded', { cv: parsedCV })
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed'
      console.error('Upload failed:', err)
    } finally {
      uploading = false
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.currentTarget?.classList.add('dragover')
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    event.currentTarget?.classList.remove('dragover')
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    event.currentTarget?.classList.remove('dragover')

    const droppedFiles = event.dataTransfer?.files
    if (droppedFiles?.length) {
      files = droppedFiles
      handleUpload()
    }
  }
</script>

<div class="upload-container">
  <label
    class="upload-area"
    class:dragover={files}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      bind:files
      on:change={handleUpload}
      disabled={uploading}
      style="display: none"
    />

    {#if uploading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Processing your CV...</p>
      </div>
    {:else if parsedCV}
      <div class="success">
        <div class="check-icon">✓</div>
        <h3>CV uploaded successfully</h3>
        <div class="cv-preview">
          {#if parsedCV.email}
            <p><strong>Email:</strong> {parsedCV.email}</p>
          {/if}
          {#if parsedCV.phone}
            <p><strong>Phone:</strong> {parsedCV.phone}</p>
          {/if}
          {#if parsedCV.skills && parsedCV.skills.length > 0}
            <p><strong>Skills:</strong> {parsedCV.skills.slice(0, 5).join(', ')}{parsedCV.skills.length > 5 ? ` +${parsedCV.skills.length - 5} more` : ''}</p>
          {/if}
        </div>
      </div>
    {:else if error}
      <div class="error">
        <div class="error-icon">⚠</div>
        <h3>Upload failed</h3>
        <p>{error}</p>
        <button on:click={() => { error = null; files = null }}>Try again</button>
      </div>
    {:else}
      <div class="placeholder">
        <div class="upload-icon">📄</div>
        <h3>Upload your CV</h3>
        <p>Drop your CV here or click to browse</p>
        <small>Supported formats: PDF, DOC, DOCX</small>
        <small>Maximum file size: 10MB</small>
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border: 2px dashed #ccc;
    border-radius: 8px;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
  }

  .upload-area:hover,
  .upload-area.dragover {
    border-color: #007bff;
    background: #f0f8ff;
  }

  .loading {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .success {
    text-align: center;
    color: #28a745;
  }

  .check-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .cv-preview {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    text-align: left;
  }

  .cv-preview p {
    margin: 0.5rem 0;
  }

  .error {
    text-align: center;
    color: #dc3545;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .placeholder {
    text-align: center;
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  small {
    display: block;
    color: #666;
    margin-top: 0.5rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background: #0056b3;
  }
</style>
