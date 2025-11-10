import { apiClient } from './client'
import type { CVSuggestion, CVBuilderSection, ParsedCV } from '$lib/types'

export async function analyzeCVSection(
  section: CVBuilderSection,
  fullCV?: Partial<ParsedCV>
): Promise<CVSuggestion[]> {
  return apiClient.post<CVSuggestion[]>(
    '/api/cv/builder/analyze',
    {
      section,
      fullCV
    },
    { timeout: 30000 }
  )
}

export async function getSuggestionForField(
  field: string,
  currentValue: string,
  context?: any
): Promise<CVSuggestion> {
  return apiClient.post<CVSuggestion>(
    '/api/cv/builder/suggest-field',
    {
      field,
      currentValue,
      context
    },
    { timeout: 15000 }
  )
}

export async function improveText(
  text: string,
  section: string,
  style?: 'professional' | 'concise' | 'detailed'
): Promise<string> {
  const response = await apiClient.post<{ improvedText: string }>(
    '/api/cv/builder/improve-text',
    {
      text,
      section,
      style
    },
    { timeout: 20000 }
  )
  return response.improvedText
}

export async function generateSummary(cv: Partial<ParsedCV>): Promise<string> {
  const response = await apiClient.post<{ summary: string }>(
    '/api/cv/builder/generate-summary',
    { cv },
    { timeout: 20000 }
  )
  return response.summary
}

export async function extractSkills(text: string): Promise<string[]> {
  const response = await apiClient.post<{ skills: string[] }>(
    '/api/cv/builder/extract-skills',
    { text },
    { timeout: 15000 }
  )
  return response.skills
}

export async function validateCV(cv: ParsedCV): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}> {
  return apiClient.post<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
  }>('/api/cv/builder/validate', { cv })
}
