import type { JobItem, RawJobData } from '$lib/types'

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') {
    return value.trim().length ? value : undefined
  }
  const str = String(value).trim()
  return str.length ? str : undefined
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const resolved = toOptionalString(value)
    if (resolved !== undefined) {
      return resolved
    }
  }
  return undefined
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .map((entry) => toOptionalString(entry))
    .filter((entry): entry is string => Boolean(entry))
}

export function normalizeJob(raw: RawJobData, fallback?: Partial<JobItem>): JobItem {
  const fallbackSkills = fallback?.skills ?? []

  const previewText = pickString(
    raw.descriptionPreview,
    raw.description_preview,
    raw.snippet?.requirement,
    raw.snippet?.responsibility,
    fallback?.descriptionPreview,
    fallback?.description
  )

  const incomingFullFlag = Boolean(
    raw.fullDescriptionLoaded ||
      raw.full_description_loaded ||
      pickString(raw.fullDescription, raw.full_description, raw.description_full)
  )

  const descriptionCandidate = pickString(raw.description, fallback?.description, previewText)

  const fullDescription = pickString(
    raw.fullDescription,
    raw.full_description,
    raw.description_full,
    incomingFullFlag ? raw.description : undefined,
    fallback?.fullDescription
  )

  const description = fullDescription ?? descriptionCandidate ?? ''

  const skills = asStringArray(raw.skills) ?? fallbackSkills

  // Extract and validate required fields
  const id = pickString(raw.id, fallback?.id)
  const title = pickString(raw.title, raw.name, fallback?.title)

  // Validate required fields
  if (!id) {
    console.warn('Job normalization: Missing job ID', raw)
    // Use a fallback ID to prevent breaking the app
    const fallbackId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.warn(`Using fallback ID: ${fallbackId}`)
  }

  if (!title) {
    console.warn('Job normalization: Missing job title', raw)
  }

  const normalized: JobItem = {
    id: id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    hh_vacancy_id: pickString(raw.hh_vacancy_id, raw.hhVacancyId, fallback?.hh_vacancy_id),
    title: title || 'Untitled Position',
    company:
      pickString(
        raw.company,
        raw.company_name,
        raw.employer?.name,
        fallback?.company
      ) || 'Company Not Specified',
    salary: pickString(raw.salary, fallback?.salary),
    area: pickString(
      typeof raw.area === 'string' ? raw.area : undefined,
      raw.area_name,
      typeof raw.area === 'object' ? raw.area?.name : undefined,
      fallback?.area
    ),
    description,
    descriptionPreview: previewText ?? descriptionCandidate ?? description,
    fullDescription: fullDescription ?? fallback?.fullDescription,
    url: pickString(raw.url, raw.alternate_url, fallback?.url),
    skills,
    has_test: (raw.has_test ?? raw.test_required ?? fallback?.has_test) || false,
    fullDescriptionLoaded:
      Boolean(raw.fullDescriptionLoaded ?? raw.full_description_loaded ?? (incomingFullFlag || fallback?.fullDescriptionLoaded))
  }

  if (!normalized.fullDescriptionLoaded && normalized.fullDescription) {
    normalized.fullDescriptionLoaded = true
  }

  // Final validation check
  if (!normalized.description && !normalized.descriptionPreview) {
    console.warn('Job normalization: No description available for job', normalized.id)
  }

  return normalized
}


