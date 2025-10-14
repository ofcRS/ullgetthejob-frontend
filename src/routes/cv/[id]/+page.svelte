<script lang="ts">
  import CVDisplay from '$lib/components/CVDisplay.svelte'
  import type { ParsedCV } from '$lib/types'

  export let params: { id: string }
  let cv: ParsedCV | null = null
  let error = ''

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  async function loadCv() {
    try {
      const res = await fetch(`${API_URL}/api/cv/${params.id}`)
      const data = await res.json()
      if (data.success) {
        // Map DB row into ParsedCV where possible
        cv = {
          firstName: data.cv.firstName,
          lastName: data.cv.lastName,
          email: data.cv.email,
          phone: data.cv.phone,
          title: data.cv.title,
          summary: data.cv.summary,
          experience: data.cv.experience,
          education: data.cv.education,
          skills: data.cv.skills,
          projects: data.cv.projects,
          fullText: data.cv.fullText
        }
      } else {
        error = data.error || 'Not found'
      }
    } catch (e) {
      error = 'Failed to load CV'
    }
  }

  loadCv()
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-4">CV</h1>
  {#if error}
    <p class="text-red-600">{error}</p>
  {:else if cv}
    <CVDisplay {cv} />
  {:else}
    <p class="text-gray-600">Loading...</p>
  {/if}
</div>


