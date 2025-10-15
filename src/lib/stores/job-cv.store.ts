import { writable, derived } from 'svelte/store'
import { selectedJob } from './jobs.store'
import type { CustomizedCV } from '$lib/types'

interface JobCvData {
  jobId: string
  customizedCv: CustomizedCV | null
  coverLetter: string
  jobSkills: any
  generatedAt: number
}

function createJobCvStore() {
  const { subscribe, set, update } = writable<Map<string, JobCvData>>(new Map())

  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('ugtj_jobCvData')
    if (stored) {
      try {
        const data = JSON.parse(stored) as Record<string, JobCvData>
        const map = new Map<string, JobCvData>(Object.entries(data))
        set(map)
      } catch (e) {
        console.error('Failed to parse job CV data:', e)
      }
    }
  }

  subscribe((value) => {
    if (typeof window !== 'undefined') {
      try {
        const obj = Object.fromEntries(value)
        sessionStorage.setItem('ugtj_jobCvData', JSON.stringify(obj))
      } catch (e) {
        console.error('Failed to save job CV data:', e)
      }
    }
  })

  return {
    subscribe,
    set,
    update,
    setJobData: (jobId: string, data: Omit<JobCvData, 'jobId' | 'generatedAt'>) => {
      update((map) => {
        map.set(jobId, {
          jobId,
          ...data,
          generatedAt: Date.now()
        })
        return map
      })
    },
    clearJobData: (jobId: string) => {
      update((map) => {
        map.delete(jobId)
        return map
      })
    },
    clearAll: () => {
      set(new Map())
    }
  }
}

export const jobCvStore = createJobCvStore()

export const currentJobCv = derived([jobCvStore, selectedJob], ([$jobCvStore, $selectedJob]) => {
  if (!$selectedJob) return null
  return $jobCvStore.get($selectedJob.id) || null
})


