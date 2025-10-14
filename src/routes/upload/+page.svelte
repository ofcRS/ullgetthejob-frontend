<script lang="ts">
  import { onMount } from 'svelte'
  import { uploadedCv, selectedModel } from '$lib/stores/cv.store'
  import type { ModelInfo } from '$lib/types'
  import { uploadCv, listCvs } from '$lib/api/cv.api'
  import { connectWebSocket, clientId as clientIdStore, wsConnection } from '$lib/stores/ws.store'
  import { goto } from '$app/navigation'
  import CVDisplay from '$lib/components/CVDisplay.svelte'

  export let data: { models: ModelInfo[] }

  let fileInput: HTMLInputElement
  let models: ModelInfo[] = []
  let error = ''
  let success = ''
  let isUploading = false
  let progressStage = ''
  let uploadedCvs: Array<{ id: string; originalFilename?: string; createdAt?: string }> = []
  let showPreview = false
  $: selected = models.find(m => m.id === $selectedModel)

  onMount(() => {
    models = data.models
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const wsUrl = api.replace('http', 'ws') + '/ws'
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
    return () => { unsub() }
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
  <h1 class="text-3xl font-bold mb-4">Upload your CV</h1>

  <label class="block text-sm font-medium text-gray-700 mb-2" for="model-select">AI Model</label>
  <select id="model-select" bind:value={$selectedModel} class="input w-full mb-2">
    {#each models as model}
      <option value={model.id}>{model.name} ({model.provider})</option>
    {/each}
  </select>
  {#if selected}
    <div class="text-xs text-gray-600 mb-4">
      <p><span class="font-medium">Selected:</span> {selected.name} ({selected.provider})</p>
      {#if selected.description}
        <p class="mt-1">{selected.description}</p>
      {/if}
      {#if selected.pricing}
        <div class="mt-1">
          <span class="font-medium">Pricing:</span>
          <span class="ml-1">{JSON.stringify(selected.pricing)}</span>
        </div>
      {/if}
    </div>
  {/if}

  <input bind:this={fileInput} type="file" accept=".pdf,.doc,.docx" on:change={handleFileUpload}
    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />

  {#if isUploading}
    <p class="text-sm text-gray-600 mt-2">{progressStage || 'Uploading...'}</p>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
    </div>
    <div>
      {#if showPreview && $uploadedCv}
        <h3 class="font-semibold mb-2">Live Preview</h3>
        <CVDisplay cv={$uploadedCv} />
      {/if}
    </div>
  </div>

  {#if error}
    <p class="text-sm text-red-600 mt-2">{error}</p>
  {/if}
  {#if success}
    <p class="text-sm text-green-600 mt-2">{success}</p>
  {/if}
</div>


