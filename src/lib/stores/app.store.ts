import { writable, derived } from 'svelte/store'

export interface AppState {
  currentStep: number
  completedSteps: number[]
  canProceed: boolean
}

export const appState = writable<AppState>({
  currentStep: 1,
  completedSteps: [],
  canProceed: false
})

export const canProceed = derived(appState, ($s) => $s.canProceed)

export function autoAdvance(step: number) {
  appState.update((state) => {
    const completed = new Set(state.completedSteps)
    completed.add(step)
    const nextStep = Math.max(state.currentStep, step) + 1
    return { ...state, completedSteps: Array.from(completed), currentStep: nextStep, canProceed: true }
  })
}

export function setStep(step: number) {
  appState.update((state) => ({ ...state, currentStep: step }))
}


