import type { CustomizedCV, ParsedCV } from '$lib/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function uploadCv(file: File): Promise<{ success: boolean; cv?: ParsedCV; id?: string; error?: string }>{
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/cv/upload`, { method: 'POST', body: form })
  return await res.json()
}

export async function customizeCv(params: { cv: ParsedCV; jobDescription: string; model?: string }): Promise<{
  success: boolean
  customizedCV?: CustomizedCV
  coverLetter?: string
  modelUsed?: string
  jobSkills?: string[]
  error?: string
}>{
  const res = await fetch(`${API_URL}/api/cv/customize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  return await res.json()
}

export async function listCvs(): Promise<{ success: boolean; items?: any[]; error?: string }> {
  const res = await fetch(`${API_URL}/api/cv`)
  return await res.json()
}

export async function submitApplication(params: { jobExternalId: string; customizedCV: CustomizedCV; coverLetter: string }) {
  const res = await fetch(`${API_URL}/api/application/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params)
  })
  return await res.json()
}


