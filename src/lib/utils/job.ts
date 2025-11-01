import type { JobItem } from '$lib/types'

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

export function normalizeJob(raw: any, fallback?: Partial<JobItem>): JobItem {
  const fallbackSkills = fallback?.skills ?? []

  const previewText = pickString(
    raw.descriptionPreview,
    raw.description_preview,
    (raw as any)?.snippet?.requirement,
    (raw as any)?.snippet?.responsibility,
    fallback?.descriptionPreview,
    fallback?.description
  )

  const incomingFullFlag = Boolean(
    (raw as any)?.fullDescriptionLoaded ||
      (raw as any)?.full_description_loaded ||
      pickString((raw as any)?.fullDescription, (raw as any)?.full_description, (raw as any)?.description_full)
  )

  const descriptionCandidate = pickString(raw.description, fallback?.description, previewText)

  const fullDescription = pickString(
    (raw as any)?.fullDescription,
    (raw as any)?.full_description,
    (raw as any)?.description_full,
    incomingFullFlag ? raw.description : undefined,
    fallback?.fullDescription
  )

  const description = fullDescription ?? descriptionCandidate ?? ''

  const skills = asStringArray(raw.skills) ?? fallbackSkills

  const normalized: JobItem = {
    id: pickString(raw.id, fallback?.id) ?? '',
    hh_vacancy_id: pickString((raw as any)?.hh_vacancy_id, (raw as any)?.hhVacancyId, fallback?.hh_vacancy_id),
    title: pickString(raw.title, (raw as any)?.name, fallback?.title) ?? '',
    company:
      pickString(
        raw.company,
        (raw as any)?.company_name,
        (raw as any)?.employer?.name,
        fallback?.company
      ) ?? '',
    salary: pickString(raw.salary, fallback?.salary),
    area: pickString(raw.area, (raw as any)?.area_name, (raw as any)?.area?.name, fallback?.area),
    description,
    descriptionPreview: previewText ?? descriptionCandidate ?? description,
    fullDescription: fullDescription ?? fallback?.fullDescription,
    url: pickString(raw.url, (raw as any)?.alternate_url, fallback?.url),
    skills,
    has_test: ((raw as any)?.has_test ?? (raw as any)?.test_required ?? fallback?.has_test) || false,
    fullDescriptionLoaded:
      Boolean((raw as any)?.fullDescriptionLoaded ?? (raw as any)?.full_description_loaded ?? (incomingFullFlag || fallback?.fullDescriptionLoaded))
  }

  if (!normalized.fullDescriptionLoaded && normalized.fullDescription) {
    normalized.fullDescriptionLoaded = true
  }

  return normalized
}


