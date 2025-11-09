export interface ParsedCV {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  summary?: string
  experience?: string
  education?: string
  skills?: string[]
  projects?: string
  fullText: string
}

export interface CustomizedCV extends ParsedCV {
  area?: string | null
}

export interface JobItem {
  id: string
  hh_vacancy_id?: string
  title: string
  company: string
  salary?: string
  area?: string
  description: string
  descriptionPreview?: string
  fullDescription?: string
  url?: string
  skills?: string[]
  has_test?: boolean
  fullDescriptionLoaded?: boolean
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  description?: string
  pricing?: any
}

// Raw job data from HH.ru API
export interface RawJobData {
  id?: string
  hh_vacancy_id?: string
  hhVacancyId?: string
  title?: string
  name?: string
  company?: string
  company_name?: string
  employer?: {
    name?: string
  }
  salary?: string
  area?: string | { name?: string }
  area_name?: string
  description?: string
  descriptionPreview?: string
  description_preview?: string
  fullDescription?: string
  full_description?: string
  description_full?: string
  url?: string
  alternate_url?: string
  skills?: string[]
  has_test?: boolean
  test_required?: boolean
  fullDescriptionLoaded?: boolean
  full_description_loaded?: boolean
  snippet?: {
    requirement?: string
    responsibility?: string
  }
}

export interface QueuedJob {
  id: string
  workflowId: string
  userId: string
  cvId: string
  jobId?: string
  jobExternalId: string
  status: 'pending' | 'customizing' | 'ready' | 'submitting' | 'submitted' | 'failed' | 'rate_limited'
  priority: number
  attempts: number
  nextRunAt: string
  lastError?: string
  createdAt: string
  updatedAt: string
  payload?: {
    jobTitle?: string
    company?: string
    addedAt?: string
  }
  job?: JobItem
  customCv?: {
    id: string
    customizedData: any
    coverLetter: string
  }
}

export interface ApplicationStatus {
  id: string
  jobTitle: string
  company: string
  status: string
  submittedAt?: string
  errorMessage?: string
  hhStatus?: string
  hhNegotiationId?: string
  coverLetter?: string
  createdAt: string
}

export interface RateLimitStatus {
  tokens: number
  capacity: number
  nextRefill: string
  canApply: boolean
  applicationsToday?: number
}

export interface WorkflowProgress {
  workflowId: string
  completed: number
  total: number
  currentJob?: string
  estimatedCompletion?: string
}


