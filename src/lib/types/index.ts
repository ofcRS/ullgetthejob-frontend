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
  url?: string
  skills?: string[]
  has_test?: boolean
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  description?: string
  pricing?: any
}


