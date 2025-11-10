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

// AI Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  context?: ChatContext
}

export interface ChatContext {
  cv?: ParsedCV | null
  job?: JobItem | null
  applications?: ApplicationStatus[]
  recentActivity?: string[]
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  metadata?: {
    model: string
    tokens?: number
  }
}

export interface StreamChatChunk {
  type: 'chunk' | 'done' | 'error'
  content?: string
  error?: string
}

// Match Scoring Types
export interface MatchScore {
  percentage: number
  matched: string[]
  unmatched: string[]
  category: 'excellent' | 'good' | 'fair' | 'poor'
  matchDetails?: {
    exact: string[]
    synonym: string[]
    fuzzy: string[]
  }
}

export interface JobWithScore extends JobItem {
  matchScore?: MatchScore
}

// Dashboard Types
export interface DashboardStats {
  totalApplications: number
  submittedCount: number
  pendingCount: number
  failedCount: number
  successRate: number
  avgMatchScore: number
  topSkills: SkillFrequency[]
  weeklyTrend: WeeklyData[]
}

export interface SkillFrequency {
  skill: string
  count: number
  matchRate: number
}

export interface WeeklyData {
  date: string
  applications: number
  success: number
}

export interface DailyStrategy {
  id: string
  type: 'action' | 'insight' | 'recommendation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  metadata?: {
    relatedJobs?: string[]
    skillsToImprove?: string[]
    estimatedImpact?: string
  }
}

export interface MarketInsight {
  category: string
  insight: string
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

// CV Builder Types
export interface CVBuilderSection {
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects'
  content: string
  suggestions?: CVSuggestion[]
}

export interface CVSuggestion {
  id: string
  type: 'improve' | 'add' | 'remove' | 'rephrase'
  section: string
  originalText?: string
  suggestedText: string
  reason: string
  confidence: number
  applied: boolean
}

export interface CVBuilderState {
  sections: CVBuilderSection[]
  activeSuggestions: CVSuggestion[]
  isAnalyzing: boolean
  lastAnalyzed?: string
}

// Application Strategy Types
export interface ApplicationStrategy {
  recommendedOrder: JobPriority[]
  timing: ApplicationTiming
  optimization: OptimizationTips
  estimatedSuccess: number
}

export interface JobPriority {
  job: JobItem
  score: number
  matchScore: MatchScore
  priority: 'immediate' | 'high' | 'medium' | 'low'
  reasons: string[]
  bestApplyTime?: string
}

export interface ApplicationTiming {
  bestDayOfWeek: string
  bestTimeOfDay: string
  recommendedPace: string
  rateLimitConsiderations: string[]
}

export interface OptimizationTips {
  cvImprovements: string[]
  skillsToHighlight: string[]
  coverLetterTips: string[]
  generalAdvice: string[]
}

// Real-time Feedback Types
export interface FeedbackNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'progress'
  title: string
  message: string
  timestamp: string
  duration?: number
  action?: {
    label: string
    href?: string
    callback?: () => void
  }
  progress?: number
  dismissible: boolean
}

export interface ProgressUpdate {
  taskId: string
  taskType: 'cv_parse' | 'cv_customize' | 'application_submit' | 'batch_process'
  progress: number
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  message: string
  details?: any
}


