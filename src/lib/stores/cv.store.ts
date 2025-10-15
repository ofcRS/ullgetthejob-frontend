import { writable } from 'svelte/store'
import type { ParsedCV, CustomizedCV } from '$lib/types'

function persisted<T>(key: string, initial: T) {
  const store = writable<T>(initial)
  if (typeof window !== 'undefined') {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      try { store.set(JSON.parse(raw)) } catch {}
    }
    store.subscribe((v) => {
      try { sessionStorage.setItem(key, JSON.stringify(v)) } catch {}
    })
  }
  return store
}

function persistedLocal<T>(key: string, initial: T) {
  const store = writable<T>(initial)
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(key)
    if (raw) {
      try { store.set(JSON.parse(raw)) } catch {}
    }
    store.subscribe((v) => {
      try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
    })
  }
  return store
}

export const uploadedCv = persisted<ParsedCV | null>('ugtj_uploadedCv', null)
export const customizedCv = persisted<CustomizedCV | null>('ugtj_customizedCv', null)
export const coverLetter = persisted<string>('ugtj_coverLetter', '')
export const selectedModel = persistedLocal<string>('ugtj_selectedModel', 'anthropic/claude-3.5-sonnet')

export function clearCustomization() {
  customizedCv.set(null)
  coverLetter.set('')
}


