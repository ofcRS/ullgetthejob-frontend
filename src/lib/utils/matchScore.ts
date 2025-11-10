import type { MatchScore } from '$lib/types'
import { calculateSkillMatch, type SkillMatchResult } from './skillMatcher'

export function convertToMatchScore(result: SkillMatchResult): MatchScore {
  const category = getMatchCategory(result.percentage)

  // Group match details by type
  const exact: string[] = []
  const synonym: string[] = []
  const fuzzy: string[] = []

  result.matchDetails.forEach(detail => {
    if (detail.matchType === 'exact' || detail.matchType === 'substring') {
      exact.push(detail.jobSkill)
    } else if (detail.matchType === 'synonym') {
      synonym.push(detail.jobSkill)
    } else if (detail.matchType === 'fuzzy') {
      fuzzy.push(detail.jobSkill)
    }
  })

  return {
    percentage: result.percentage,
    matched: result.matched,
    unmatched: result.unmatched,
    category,
    matchDetails: {
      exact,
      synonym,
      fuzzy
    }
  }
}

export function getMatchCategory(percentage: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (percentage >= 80) return 'excellent'
  if (percentage >= 60) return 'good'
  if (percentage >= 40) return 'fair'
  return 'poor'
}

export function calculateJobMatchScore(
  cvSkills: string[],
  jobSkills: string[],
  fuzzyThreshold = 0.8
): MatchScore {
  const result = calculateSkillMatch(cvSkills, jobSkills, fuzzyThreshold)
  return convertToMatchScore(result)
}
