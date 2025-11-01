<script lang="ts">
  import { onMount } from 'svelte'
  import { uploadedCv, selectedModel } from '$lib/stores/cv.store'
  import type { ModelInfo } from '$lib/types'
  import { uploadCv, listCvs } from '$lib/api/cv.api'
  import { connectWebSocket, clientId as clientIdStore, wsConnection } from '$lib/stores/ws.store'
  import { goto } from '$app/navigation'
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  export let data: { models: ModelInfo[] }

  let fileInput: HTMLInputElement
  let models: ModelInfo[] = []
  let error = ''
  let success = ''
  let isUploading = false
  let progressStage = ''
  let uploadedCvs: Array<{ id: string; originalFilename?: string; createdAt?: string }> = []
  let showPreview = false
  let hhConnected = false
  let hhResumes: any[] = []
  let isImporting = false
  let hhStatusInterval: ReturnType<typeof setInterval> | null = null
  $: selected = models.find(m => m.id === $selectedModel)

  onMount(() => {
    models = data.models
    const wsUrl = API.replace('http', 'ws') + '/ws'
    const id = crypto.randomUUID()
    connectWebSocket(wsUrl, id)
    const unsub = wsConnection.subscribe((ws) => {
      if (!ws) return
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'cv_progress') {
            progressStage = msg.stage
          }
        } catch {}
      }
    })
    checkHHStatus()
    hhStatusInterval = setInterval(checkHHStatus, 5 * 60 * 1000)
    return () => {
      unsub()
      if (hhStatusInterval) clearInterval(hhStatusInterval)
    }
  })

  async function loadPreviousCVs() {
    try {
      const res = await listCvs()
      if (res.success && res.items) {
        uploadedCvs = res.items.map((r: any) => ({ id: r.id, originalFilename: r.originalFilename, createdAt: r.createdAt }))
      }
    } catch {}
  }

  loadPreviousCVs()

  async function checkHHStatus() {
    try {
      const res = await fetch(`${API}/api/auth/hh/status`, {
        credentials: 'include'
      })
      const data = await res.json()
      hhConnected = !!data.connected
      if (hhConnected) {
        await loadHHResumes()
      } else {
        hhResumes = []
      }
    } catch (err) {
      console.error('Failed to check HH status:', err)
      hhConnected = false
    }
  }

  async function loadHHResumes() {
    try {
      const res = await fetch(`${API}/api/hh/resumes`, {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) hhResumes = data.items || []
    } catch (err) {
      console.error('Failed to load HH resumes:', err)
    }
  }

  async function connectHH() {
    const res = await fetch(`${API}/api/auth/hh/login`, {
      credentials: 'include'
    })
    const data = await res.json()
    if (data?.url) {
      window.location.href = data.url
    }
  }

  async function importFromHH(resumeId: string) {
    try {
      isImporting = true
      const res = await fetch(`${API}/api/cv/import/hh/${resumeId}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success && data.cv) {
        uploadedCv.set(data.cv)
        showPreview = true
        success = 'Imported resume from HH.ru successfully!'
      } else {
        error = data.error || 'Failed to import resume'
      }
    } catch (e) {
      error = 'Network error during import'
    } finally {
      isImporting = false
    }
  }

  async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement
    if (!input.files?.[0]) return
    const file = input.files[0]
    error = ''
    success = ''
    isUploading = true
    let cid = ''
    clientIdStore.subscribe((v) => cid = v)()
    const form = new FormData()
    form.append('file', file)
    form.append('clientId', cid)
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const res = await fetch(`${api}/api/cv/upload`, { method: 'POST', body: form }).then(r => r.json())
    if (res.success && res.cv) {
      uploadedCv.set(res.cv)
      success = 'CV uploaded and parsed successfully with AI!'
      showPreview = true
      await loadPreviousCVs()
      setTimeout(() => goto('/cv'), 400)
    } else {
      error = res.error || 'Upload failed'
    }
    isUploading = false
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-screen-2xl">
  <div class="max-w-4xl mx-auto text-center mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome to UllGetTheJob</h1>
    <p class="text-lg md:text-xl text-gray-600">Upload your CV and let AI create personalized applications in minutes</p>
  </div>

  <!-- Model selection moved to Global Settings -->

  <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
    <div class="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-dashed border-blue-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer" on:click={() => fileInput?.click()} role="button" tabindex="0" aria-label="Upload CV from computer" on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput?.click()}>
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors duration-300">
          <span class="text-2xl">⬆️</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Upload from Computer</h3>
        <p class="text-gray-600 text-sm mb-4">PDF, DOC, or DOCX format • Max 10MB</p>
        <input type="file" class="hidden" bind:this={fileInput} accept=".pdf,.doc,.docx" on:change={handleFileUpload} />
        <button class="btn btn-primary">Browse Files</button>
      </div>
      <div class="absolute inset-0 bg-blue-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
        <p class="text-white font-semibold">Drop your CV here</p>
      </div>
    </div>

    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <span class="text-2xl">🌐</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Import from HH.ru</h3>
        <p class="text-gray-600 text-sm mb-4">{hhConnected ? 'Select from your saved resumes' : 'Connect your HH.ru account'}</p>
        {#if hhConnected}
          {#if hhResumes.length}
            <div class="max-h-40 overflow-y-auto text-left space-y-2">
              {#each hhResumes as r}
                <div class="flex items-center gap-2">
                  <span class="flex-1 text-sm">{r.title || r.id}</span>
                  <button class="btn btn-secondary text-xs" disabled={isImporting} on:click={() => importFromHH(r.id)}>{isImporting ? 'Importing...' : 'Import'}</button>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-sm text-gray-600">No resumes found</p>
          {/if}
        {:else}
          <button class="btn btn-secondary" on:click={connectHH}>Connect HH.ru</button>
        {/if}
      </div>
    </div>
  </div>

  {#if isUploading}
    <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg" aria-live="polite">
      <div class="flex items-center gap-4 mb-3">
        <div class="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        <span class="font-medium text-gray-900">{progressStage || 'Uploading...'}</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full bg-blue-600 rounded-full animate-progress"></div>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
    <div>
      {#if uploadedCvs.length > 0}
        <h3 class="font-semibold mb-2">Previously Uploaded CVs</h3>
        <div class="space-y-2">
          {#each uploadedCvs as cv}
            <a class="text-blue-700 hover:underline text-sm" href={`/cv/${cv.id}`}>
              {cv.originalFilename || cv.id}
              {#if cv.createdAt}
                <span class="text-gray-500"> – {new Date(cv.createdAt).toLocaleString()}</span>
              {/if}
            </a>
          {/each}
        </div>
      {/if}
      {#if error}
        <p class="text-sm text-red-600 mt-2">{error}</p>
      {/if}
      {#if success}
        <p class="text-sm text-green-600 mt-2">{success}</p>
      {/if}
    </div>
    <div>
      {#if showPreview && $uploadedCv}
        <h3 class="font-semibold mb-2">Live Preview</h3>
        <CVDisplay cv={$uploadedCv} />
      {/if}
    </div>
  </div>
</div>


