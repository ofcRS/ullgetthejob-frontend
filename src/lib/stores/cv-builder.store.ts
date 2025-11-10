import { writable, derived, get } from 'svelte/store'
import type { CVBuilderState, CVSuggestion, CVBuilderSection, ParsedCV } from '$lib/types'

function createPersistentStore<T>(key: string, initial: T) {
  const store = writable<T>(initial)

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      try {
        store.set(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored data:', e)
      }
    }

    store.subscribe((value) => {
      sessionStorage.setItem(key, JSON.stringify(value))
    })
  }

  return store
}

const initialState: CVBuilderState = {
  sections: [],
  activeSuggestions: [],
  isAnalyzing: false
}

export const cvBuilderState = createPersistentStore<CVBuilderState>('cv_builder_state', initialState)

// Derived stores
export const isAnalyzing = derived(cvBuilderState, $state => $state.isAnalyzing)
export const sections = derived(cvBuilderState, $state => $state.sections)
export const activeSuggestions = derived(cvBuilderState, $state => $state.activeSuggestions)

// Pending suggestions (not yet applied)
export const pendingSuggestions = derived(activeSuggestions, $suggestions =>
  $suggestions.filter(s => !s.applied)
)

// Applied suggestions
export const appliedSuggestions = derived(activeSuggestions, $suggestions =>
  $suggestions.filter(s => s.applied)
)

// High confidence suggestions
export const highConfidenceSuggestions = derived(pendingSuggestions, $suggestions =>
  $suggestions.filter(s => s.confidence >= 0.8)
)

// CV Builder functions
export function initializeCV(cv?: Partial<ParsedCV>) {
  const defaultSections: CVBuilderSection[] = [
    {
      type: 'personal',
      content: cv
        ? `${cv.firstName || ''} ${cv.lastName || ''}\n${cv.email || ''}\n${cv.phone || ''}`
        : ''
    },
    {
      type: 'summary',
      content: cv?.summary || ''
    },
    {
      type: 'experience',
      content: cv?.experience || ''
    },
    {
      type: 'education',
      content: cv?.education || ''
    },
    {
      type: 'skills',
      content: cv?.skills?.join(', ') || ''
    },
    {
      type: 'projects',
      content: cv?.projects || ''
    }
  ]

  cvBuilderState.update(state => ({
    ...state,
    sections: defaultSections
  }))
}

export function updateSection(type: CVBuilderSection['type'], content: string) {
  cvBuilderState.update(state => ({
    ...state,
    sections: state.sections.map(s => (s.type === type ? { ...s, content } : s))
  }))
}

export function addSuggestions(suggestions: CVSuggestion[]) {
  cvBuilderState.update(state => ({
    ...state,
    activeSuggestions: [...state.activeSuggestions, ...suggestions]
  }))
}

export function applySuggestion(suggestionId: string) {
  const state = get(cvBuilderState)
  const suggestion = state.activeSuggestions.find(s => s.id === suggestionId)

  if (!suggestion) return

  // Update the section with the suggested text
  const sectionType = suggestion.section as CVBuilderSection['type']
  const section = state.sections.find(s => s.type === sectionType)

  if (section) {
    let newContent = section.content

    if (suggestion.type === 'improve' || suggestion.type === 'rephrase') {
      if (suggestion.originalText) {
        newContent = newContent.replace(suggestion.originalText, suggestion.suggestedText)
      } else {
        newContent = suggestion.suggestedText
      }
    } else if (suggestion.type === 'add') {
      newContent = newContent ? `${newContent}\n${suggestion.suggestedText}` : suggestion.suggestedText
    } else if (suggestion.type === 'remove' && suggestion.originalText) {
      newContent = newContent.replace(suggestion.originalText, '')
    }

    updateSection(sectionType, newContent)
  }

  // Mark suggestion as applied
  cvBuilderState.update(state => ({
    ...state,
    activeSuggestions: state.activeSuggestions.map(s =>
      s.id === suggestionId ? { ...s, applied: true } : s
    )
  }))
}

export function dismissSuggestion(suggestionId: string) {
  cvBuilderState.update(state => ({
    ...state,
    activeSuggestions: state.activeSuggestions.filter(s => s.id !== suggestionId)
  }))
}

export function clearSuggestions() {
  cvBuilderState.update(state => ({
    ...state,
    activeSuggestions: []
  }))
}

export function setAnalyzing(isAnalyzing: boolean) {
  cvBuilderState.update(state => ({
    ...state,
    isAnalyzing
  }))
}

export function updateLastAnalyzed() {
  cvBuilderState.update(state => ({
    ...state,
    lastAnalyzed: new Date().toISOString()
  }))
}

export function exportCV(): ParsedCV {
  const state = get(cvBuilderState)
  const personalSection = state.sections.find(s => s.type === 'personal')?.content || ''
  const lines = personalSection.split('\n')

  const nameLine = lines[0] || ''
  const nameParts = nameLine.trim().split(' ')

  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: lines[1]?.trim() || '',
    phone: lines[2]?.trim() || '',
    title: '',
    summary: state.sections.find(s => s.type === 'summary')?.content || '',
    experience: state.sections.find(s => s.type === 'experience')?.content || '',
    education: state.sections.find(s => s.type === 'education')?.content || '',
    skills:
      state.sections
        .find(s => s.type === 'skills')
        ?.content.split(',')
        .map(s => s.trim())
        .filter(Boolean) || [],
    projects: state.sections.find(s => s.type === 'projects')?.content || '',
    fullText: state.sections.map(s => s.content).join('\n\n')
  }
}

export function resetBuilder() {
  cvBuilderState.set(initialState)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('cv_builder_state')
  }
}
